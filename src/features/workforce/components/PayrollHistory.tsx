import { useMemo, useState } from 'react';
import { 
  Download, 
  FileText, 
  DollarSign, 
  Clock, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Check, 
  Printer
} from 'lucide-react';
import { Table, Column } from '@/shared/components/ui/Table';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { formatCurrency } from '@/shared/utils';
import { useGetWorkerPayrollsQuery, usePayWorkerPayrollMutation } from '@/store/payrollApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PayrollHistoryProps {
  worker?: any;
}

export function PayrollHistory({ worker }: PayrollHistoryProps) {
  const hourlyRate = Number(worker?.hourlyRate) || 0;
  const attendances: any[] = worker?.attendances || [];
  const workerId = worker?.id;

  // Real database payroll records
  const { data: dbPayrolls = [], isLoading: isLoadingPayrolls } = useGetWorkerPayrollsQuery(workerId, {
    skip: !workerId,
  });
  const [payWorkerPayroll, { isLoading: isPaying }] = usePayWorkerPayrollMutation();

  // Modal states
  const [selectedPeriodForPayment, setSelectedPeriodForPayment] = useState<any | null>(null);
  const [modalHours, setModalHours] = useState<number>(0);
  const [modalRate, setModalRate] = useState<number>(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Direct Deposit' | 'Bank Wire' | 'Company Cheque' | 'Cash'>('Direct Deposit');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [receiptRecord, setReceiptRecord] = useState<any | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Live calculations for payment modal
  const modalGross = parseFloat(((modalHours || 0) * (modalRate || 0)).toFixed(2));
  const modalDeductions = parseFloat((modalGross * 0.18).toFixed(2));
  const modalNet = parseFloat((modalGross - modalDeductions).toFixed(2));

  // Calculate actual payroll records from recorded attendances and merge with DB records
  const payrollRows = useMemo(() => {
    // Group attendances by month/period (1st half: 1-15, 2nd half: 16-end of month)
    const periodsMap = new Map<string, { hours: number; startDate: Date; endDate: Date }>();

    attendances.forEach((att: any) => {
      const d = new Date(att.date);
      if (isNaN(d.getTime())) return;
      
      const isFirstHalf = d.getDate() <= 15;
      const periodKey = `${d.getFullYear()}-${d.getMonth()}-${isFirstHalf ? '1' : '2'}`;
      const hours = Number(att.totalHours ?? att.sessions?.[0]?.hoursWorked ?? 0);

      const existing = periodsMap.get(periodKey);
      if (existing) {
        existing.hours += hours;
        if (d < existing.startDate) existing.startDate = d;
        if (d > existing.endDate) existing.endDate = d;
      } else {
        periodsMap.set(periodKey, {
          hours,
          startDate: d,
          endDate: d,
        });
      }
    });

    const rows: any[] = [];
    let idCounter = 1;

    periodsMap.forEach((val, key) => {
      const [yearStr, monthStr, half] = key.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      const d = new Date(year, month, 1);
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      const lastDay = new Date(year, month + 1, 0).getDate();
      
      const periodLabel = half === '1'
        ? `${monthName} 1 - ${monthName} 15, ${year}`
        : `${monthName} 16 - ${monthName} ${lastDay}, ${year}`;

      const periodStartDate = half === '1'
        ? new Date(year, month, 1)
        : new Date(year, month, 16);

      const periodEndDate = half === '1'
        ? new Date(year, month, 15)
        : new Date(year, month, lastDay);

      // Check if DB payroll matches this period
      const matchingDbPayroll = dbPayrolls.find((p: any) => {
        const pStart = new Date(p.payPeriodStart);
        const pEnd = new Date(p.payPeriodEnd);
        return (
          Math.abs(pStart.getTime() - periodStartDate.getTime()) < 4 * 24 * 3600 * 1000 &&
          Math.abs(pEnd.getTime() - periodEndDate.getTime()) < 4 * 24 * 3600 * 1000
        );
      });

      const totalHours = parseFloat(val.hours.toFixed(1));
      const rate = (matchingDbPayroll?.ratePerHour && matchingDbPayroll.ratePerHour > 0)
        ? matchingDbPayroll.ratePerHour
        : (hourlyRate || 35);
      const gross = (matchingDbPayroll?.grossPay && matchingDbPayroll.grossPay > 0)
        ? matchingDbPayroll.grossPay
        : parseFloat((totalHours * rate).toFixed(2));
      const deductions = (matchingDbPayroll?.deductions && matchingDbPayroll.deductions > 0)
        ? matchingDbPayroll.deductions
        : parseFloat((gross * 0.18).toFixed(2));
      const net = (matchingDbPayroll?.netPay && matchingDbPayroll.netPay > 0)
        ? matchingDbPayroll.netPay
        : parseFloat((gross - deductions).toFixed(2));
      const isPaid = matchingDbPayroll?.status === 'paid';

      rows.push({
        id: idCounter++,
        payrollId: matchingDbPayroll?.id,
        period: periodLabel,
        hours: totalHours,
        rate,
        gross,
        deductions,
        net,
        status: isPaid ? 'paid' : (totalHours > 0 ? 'pending' : 'draft'),
        paidAt: matchingDbPayroll?.processedAt,
        paymentMethod: 'Direct Deposit',
        startDate: periodStartDate,
        endDate: periodEndDate,
        date: half === '1' ? `${monthName} 16, ${year}` : `${monthName} 1, ${month === 11 ? year + 1 : year}`,
      });
    });

    // Also include any standalone DB payrolls
    dbPayrolls.forEach((dbP: any) => {
      const alreadyIncluded = rows.some((r) => r.payrollId === dbP.id);
      if (!alreadyIncluded) {
        const dbStart = new Date(dbP.payPeriodStart);
        const dbEnd = new Date(dbP.payPeriodEnd);
        const monthName = dbStart.toLocaleString('en-US', { month: 'short' });
        const periodLabel = `${monthName} ${dbStart.getDate()} - ${dbEnd.toLocaleString('en-US', { month: 'short' })} ${dbEnd.getDate()}, ${dbStart.getFullYear()}`;
        const hours = dbP.regularHours + dbP.overtimeHours;
        const rate = dbP.ratePerHour > 0 ? dbP.ratePerHour : (hourlyRate || 35);
        const gross = dbP.grossPay > 0 ? dbP.grossPay : parseFloat((hours * rate).toFixed(2));
        const deductions = dbP.deductions > 0 ? dbP.deductions : parseFloat((gross * 0.18).toFixed(2));
        const net = dbP.netPay > 0 ? dbP.netPay : parseFloat((gross - deductions).toFixed(2));

        rows.push({
          id: idCounter++,
          payrollId: dbP.id,
          period: periodLabel,
          hours: parseFloat(hours.toFixed(1)),
          rate,
          gross,
          deductions,
          net,
          status: dbP.status,
          paidAt: dbP.processedAt,
          paymentMethod: 'Direct Deposit',
          startDate: dbStart,
          endDate: dbEnd,
          date: dbEnd.toLocaleDateString(),
        });
      }
    });

    return rows.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }, [attendances, hourlyRate, dbPayrolls]);

  // Aggregate metrics
  const totalEarnings = payrollRows.reduce((acc, r) => acc + r.gross, 0);
  const totalHoursWorked = payrollRows.reduce((acc, r) => acc + r.hours, 0);
  const totalPaidOut = payrollRows.filter(r => r.status === 'paid').reduce((acc, r) => acc + r.net, 0);
  const totalPendingPayout = payrollRows.filter(r => r.status !== 'paid').reduce((acc, r) => acc + r.net, 0);
  const unpaidPeriods = payrollRows.filter(r => r.status !== 'paid');

  // PDF Export function
  const handleExportPDF = () => {
    if (payrollRows.length === 0) {
      alert('No payroll records to export.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const primaryColor: [number, number, number] = [29, 79, 109]; // #1D4F6D
    const darkGray: [number, number, number] = [30, 41, 59];
    const lightGray: [number, number, number] = [100, 116, 139];

    // Header Background Accent Bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 595.28, 42, 'F');

    // Title & Brand
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text('FINIS WORKFORCE MANAGEMENT', 40, 27);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('OFFICIAL PAYROLL STATEMENT & PAY STUB', 595.28 - 40, 27, { align: 'right' });

    // Worker Summary Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(40, 55, 515.28, 70, 6, 6, 'FD');

    // Worker Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(worker?.name || 'Worker', 55, 76);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(`Role: ${worker?.role || 'Staff Worker'}   |   Email: ${worker?.email || 'N/A'}   |   Phone: ${worker?.phone || 'N/A'}`, 55, 93);
    doc.text(`Base Hourly Pay Rate: $${(hourlyRate || 35).toFixed(2)}/hr   |   Payment Method: Direct Deposit`, 55, 109);

    // Meta right side
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(`Statement Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, 595.28 - 55, 76, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(`Worker ID: #${(worker?.id || 'WK').slice(-8).toUpperCase()}`, 595.28 - 55, 93, { align: 'right' });
    doc.text(`Total Records: ${payrollRows.length}`, 595.28 - 55, 109, { align: 'right' });

    // Financial KPI Summary Tiles (3 Mini Cards)
    const cardY = 135;
    const cardWidth = 165;
    const cardHeight = 44;
    const gap = 10;

    // Card 1: Total Gross
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(219, 234, 254);
    doc.roundedRect(40, cardY, cardWidth, cardHeight, 4, 4, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(59, 130, 246);
    doc.text('TOTAL GROSS EARNINGS', 48, cardY + 16);
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.text(`$${totalEarnings.toFixed(2)}`, 48, cardY + 34);

    // Card 2: Total Deductions
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(40 + cardWidth + gap, cardY, cardWidth, cardHeight, 4, 4, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(239, 68, 68);
    doc.text('EST. DEDUCTIONS (CPP/EI/TAX 18%)', 48 + cardWidth + gap, cardY + 16);
    doc.setFontSize(12);
    doc.setTextColor(153, 27, 27);
    doc.text(`-$${(totalEarnings * 0.18).toFixed(2)}`, 48 + cardWidth + gap, cardY + 34);

    // Card 3: Total Net Paid / Payable
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(40 + (cardWidth + gap) * 2, cardY, cardWidth, cardHeight, 4, 4, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(16, 185, 129);
    doc.text('NET DISBURSEMENT AMOUNT', 48 + (cardWidth + gap) * 2, cardY + 16);
    doc.setFontSize(12);
    doc.setTextColor(6, 95, 70);
    doc.text(`$${(totalEarnings * 0.82).toFixed(2)}`, 48 + (cardWidth + gap) * 2, cardY + 34);

    // Payroll Table
    const tableHeaders = [
      'Pay Period',
      'Hours',
      'Rate',
      'Gross Pay',
      'Deductions (18%)',
      'Net Pay',
      'Status',
      'Disbursed'
    ];

    const tableData = payrollRows.map((r) => [
      r.period,
      `${r.hours} hrs`,
      `$${r.rate.toFixed(2)}`,
      `$${r.gross.toFixed(2)}`,
      `-$${r.deductions.toFixed(2)}`,
      `$${r.net.toFixed(2)}`,
      r.status.toUpperCase(),
      r.paidAt ? new Date(r.paidAt).toLocaleDateString() : (r.status === 'paid' ? r.date : 'Pending')
    ]);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 195,
      theme: 'grid',
      headStyles: {
        fillColor: [29, 79, 109],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 6,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.5,
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', cellWidth: 120 },
        1: { halign: 'center', cellWidth: 45 },
        2: { halign: 'right', cellWidth: 45 },
        3: { halign: 'right', cellWidth: 55 },
        4: { halign: 'right', cellWidth: 65, textColor: [220, 38, 38] },
        5: { halign: 'right', fontStyle: 'bold', cellWidth: 55, textColor: [16, 185, 129] },
        6: { halign: 'center', fontStyle: 'bold', cellWidth: 65 },
        7: { halign: 'center', cellWidth: 65 },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      foot: [[
        'Total Summary',
        `${totalHoursWorked.toFixed(1)} hrs`,
        '-',
        `$${totalEarnings.toFixed(2)}`,
        `-$${(totalEarnings * 0.18).toFixed(2)}`,
        `$${(totalEarnings * 0.82).toFixed(2)}`,
        '-',
        '-'
      ]],
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [29, 79, 109],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'right',
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 6) {
          if (data.cell.raw === 'PAID') {
            data.cell.styles.textColor = [16, 185, 129];
          } else {
            data.cell.styles.textColor = [217, 119, 6];
          }
        }
      },
      margin: { left: 40, right: 40 },
    });

    // Footer note
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('This payroll statement is an official computer-generated document issued by FINIS Workforce Systems.', 40, 815);
      doc.text(`Page ${i} of ${pageCount}`, 595.28 - 40, 815, { align: 'right' });
    }

    const safeName = (worker?.name || 'worker').toLowerCase().replace(/[^a-z0-9]/gi, '_');
    const today = new Date().toISOString().split('T')[0];
    doc.save(`payroll_stubs_${safeName}_${today}.pdf`);
  };

  // CSV Export function
  const handleExportCSV = () => {
    if (payrollRows.length === 0) {
      alert('No payroll records to export.');
      return;
    }

    const headers = ['Pay Period', 'Worker Name', 'Logged Hours', 'Hourly Rate', 'Gross Earnings', 'Deductions (18%)', 'Net Payable', 'Status', 'Payout Date'];
    const rows = payrollRows.map((r) => [
      `"${r.period.replace(/"/g, '""')}"`,
      `"${(worker?.name || 'Worker').replace(/"/g, '""')}"`,
      `"${r.hours}"`,
      `"${formatCurrency(r.rate)}"`,
      `"${formatCurrency(r.gross)}"`,
      `"${formatCurrency(r.deductions)}"`,
      `"${formatCurrency(r.net)}"`,
      `"${r.status.toUpperCase()}"`,
      `"${r.paidAt ? new Date(r.paidAt).toLocaleDateString() : r.date}"`,
    ]);

    const csvString = [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll_stubs_${(worker?.name || 'worker').toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Payment triggers
  const handleOpenPayModal = (row: any) => {
    setSelectedPeriodForPayment(row);
    const effectiveHours = row.hours > 0 ? row.hours : 8;
    const effectiveRate = row.rate > 0 ? row.rate : (hourlyRate || 35);
    setModalHours(effectiveHours);
    setModalRate(effectiveRate);
    setPaymentNotes(`Payroll disbursement for ${worker?.name || 'Worker'} - ${row.period}`);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    const effectiveWorkerId = workerId || worker?.userId;
    if (!selectedPeriodForPayment || !effectiveWorkerId) return;

    try {
      const payload = {
        workerId: effectiveWorkerId,
        payPeriodStart: selectedPeriodForPayment.startDate.toISOString().split('T')[0],
        payPeriodEnd: selectedPeriodForPayment.endDate.toISOString().split('T')[0],
        hours: Number(modalHours),
        ratePerHour: Number(modalRate),
        grossPay: modalGross,
        deductions: modalDeductions,
        netPay: modalNet,
        paymentMethod,
        notes: paymentNotes || undefined,
        payrollId: selectedPeriodForPayment.payrollId || undefined,
      };

      const result = await payWorkerPayroll(payload).unwrap();
      setIsPaymentModalOpen(false);
      
      // Open receipt view
      setReceiptRecord({
        ...selectedPeriodForPayment,
        hours: Number(modalHours),
        rate: Number(modalRate),
        gross: modalGross,
        deductions: modalDeductions,
        net: modalNet,
        status: 'paid',
        paidAt: result.payroll?.processedAt || new Date().toISOString(),
        paymentMethod,
        payrollId: result.payroll?.id,
        notes: paymentNotes,
      });
      setSelectedPeriodForPayment(null);
      setIsReceiptModalOpen(true);
    } catch (err: any) {
      alert(err?.data?.message || 'Payment processing failed. Please try again.');
    }
  };

  const handleViewReceipt = (row: any) => {
    setReceiptRecord(row);
    setIsReceiptModalOpen(true);
  };

  const columns: Column<any>[] = [
    {
      header: 'Pay Period',
      key: 'period',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl text-[#1D4F6D]">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{row.period}</p>
            <p className="text-xs text-gray-400 font-medium">Payout on {row.date}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Logged Hours',
      key: 'hours',
      render: (row: any) => <span className="font-bold text-gray-800">{row.hours}h</span>,
    },
    {
      header: 'Hourly Rate',
      key: 'rate',
      render: (row: any) => <span className="text-gray-700 font-semibold">{formatCurrency(row.rate)}/h</span>,
    },
    {
      header: 'Gross Pay',
      key: 'gross',
      render: (row: any) => (
        <span className="font-bold text-gray-900">
          {formatCurrency(row.gross)}
        </span>
      ),
    },
    {
      header: 'Est. Net Pay',
      key: 'net',
      render: (row: any) => (
        <span className="font-black text-green-600">
          {formatCurrency(row.net)}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row: any) => {
        if (row.status === 'paid') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Paid
            </span>
          );
        }

        if (row.hours > 0 && row.net > 0) {
          return (
            <Badge variant="warning" className="capitalize font-bold text-xs">
              Pending Payment
            </Badge>
          );
        }

        return (
          <Badge variant="secondary" className="capitalize font-bold text-xs">
            Draft
          </Badge>
        );
      },
    },
    {
      header: 'Action',
      key: 'action',
      render: (row: any) => {
        if (row.status === 'paid') {
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewReceipt(row)}
              className="h-8 text-xs font-bold rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Receipt
            </Button>
          );
        }

        return (
          <Button
            size="sm"
            disabled={isPaying}
            onClick={() => handleOpenPayModal(row)}
            className="h-8 text-xs font-black rounded-xl bg-[#1D4F6D] hover:bg-[#153a50] text-white shadow-sm hover:shadow gap-1.5 transition-all px-3.5 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Pay Now
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-100 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#1D4F6D]">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Hourly Rate</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{formatCurrency(hourlyRate || 35)}/hr</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Hours Recorded</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{totalHoursWorked.toFixed(1)} hrs</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Paid Out</p>
              <p className="text-xl font-black text-emerald-600 mt-0.5">{formatCurrency(totalPaidOut)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Payout</p>
              <p className="text-xl font-black text-amber-600 mt-0.5">{formatCurrency(totalPendingPayout)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {payrollRows.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-gray-200 rounded-2xl bg-gray-50/50">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">No Payroll Periods Processed Yet</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
            Pay stubs are automatically computed based on approved attendance sessions and the worker's base rate (${hourlyRate || 35}/hr).
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Payroll Periods</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {unpaidPeriods.length} period(s) awaiting payment
              </p>
            </div>

            <div className="flex items-center gap-2">
              {unpaidPeriods.length > 0 && (
                <Button
                  size="sm"
                  onClick={() => handleOpenPayModal(unpaidPeriods[0])}
                  disabled={isPaying}
                  className="bg-[#1D4F6D] hover:bg-[#153a50] text-white text-xs font-black rounded-xl h-9 gap-1.5 shadow-sm cursor-pointer"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Pay Latest Period ({formatCurrency(unpaidPeriods[0].net > 0 ? unpaidPeriods[0].net : (unpaidPeriods[0].hours > 0 ? unpaidPeriods[0].hours * (unpaidPeriods[0].rate || hourlyRate || 35) * 0.82 : 35 * 8 * 0.82))})
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportPDF}
                className="gap-2 text-xs font-bold rounded-xl h-9 hover:bg-gray-50 border-gray-300 text-gray-800 shadow-sm cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5 text-[#1D4F6D]" />
                Export Pay Stubs (PDF)
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleExportCSV}
                title="Export as CSV / Excel spreadsheet"
                className="gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 h-9 px-2.5 rounded-xl cursor-pointer"
              >
                <Download className="h-3 w-3" />
                CSV
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <Table columns={columns} data={payrollRows} />
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Process Payroll Payout"
        maxWidth="md"
      >
        {selectedPeriodForPayment && (
          <div className="space-y-5 pt-1">
            {/* Worker Summary Banner */}
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="h-11 w-11 rounded-xl bg-[#1D4F6D] text-white flex items-center justify-center font-black text-sm uppercase">
                {(worker?.name || 'W').charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 leading-tight">{worker?.name || 'Worker'}</h4>
                <p className="text-xs text-gray-500 font-medium">
                  {worker?.role || 'Worker'} • Rate: <span className="font-bold text-[#1D4F6D]">{formatCurrency(selectedPeriodForPayment.rate)}/hr</span>
                </p>
              </div>
              <Badge variant="outline" className="font-bold text-xs bg-white">
                {selectedPeriodForPayment.hours} hrs
              </Badge>
            </div>

            {/* Pay Period & Dates */}
            <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1D4F6D]" />
                <span className="font-bold text-gray-900">{selectedPeriodForPayment.period}</span>
              </div>
              <span className="text-gray-500 font-medium">Regular Cycle</span>
            </div>

            {/* Hours and Rate adjustment */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                  Payable Hours
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={modalHours}
                    onChange={(e) => setModalHours(parseFloat(e.target.value) || 0)}
                    className="font-bold text-xs rounded-xl pr-8"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-semibold pointer-events-none">hrs</span>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                  Hourly Rate ($)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={modalRate}
                    onChange={(e) => setModalRate(parseFloat(e.target.value) || 0)}
                    className="font-bold text-xs rounded-xl pl-6"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-semibold pointer-events-none">$</span>
                </div>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Total Payable Hours</span>
                <span className="font-bold text-gray-900">{modalHours} hrs</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Hourly Pay Rate</span>
                <span className="font-bold text-gray-900">{formatCurrency(modalRate)} / hr</span>
              </div>
              <div className="flex justify-between text-gray-600 pt-1 border-t border-gray-200">
                <span>Gross Earnings</span>
                <span className="font-bold text-gray-900">{formatCurrency(modalGross)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Estimated Deductions (CPP, EI, Tax 18%)</span>
                <span className="font-bold text-red-500">-{formatCurrency(modalDeductions)}</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-gray-200">
                <span className="font-black text-gray-900 text-sm">Net Payable Amount</span>
                <span className="font-black text-green-600 text-lg">
                  {formatCurrency(modalNet)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Direct Deposit', 'Bank Wire', 'Company Cheque', 'Cash'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`p-2.5 text-xs font-bold rounded-xl border transition-all text-left flex items-center justify-between ${
                      paymentMethod === method
                        ? 'border-[#1D4F6D] bg-blue-50/50 text-[#1D4F6D]'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{method}</span>
                    {paymentMethod === method && <Check className="w-3.5 h-3.5 text-[#1D4F6D]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Reference / Notes */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Payment Reference / Note (Optional)</label>
              <Input
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="e.g. Transaction Ref, Bank Transfer ID, or approval memo..."
                className="text-xs rounded-xl"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-1/3 rounded-xl text-xs font-bold h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={isPaying}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black h-10 gap-1.5 shadow-sm"
              >
                {isPaying ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Payout...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm & Mark as Paid ({formatCurrency(modalNet)})
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Receipt / Slip Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Payment Receipt & Voucher"
        maxWidth="md"
      >
        {receiptRecord && (
          <div className="space-y-5 pt-1">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-black text-emerald-900">Payment Successfully Recorded</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Voucher marked as Paid on {receiptRecord.paidAt ? new Date(receiptRecord.paidAt).toLocaleDateString() : 'Today'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Worker</span>
                <span className="font-bold text-gray-900">{worker?.name || 'Worker'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Pay Period</span>
                <span className="font-bold text-gray-900">{receiptRecord.period}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Total Hours</span>
                <span className="font-bold text-gray-900">{receiptRecord.hours} hrs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Hourly Rate</span>
                <span className="font-bold text-gray-900">{formatCurrency(receiptRecord.rate)}/hr</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-bold text-gray-900">{receiptRecord.paymentMethod || 'Direct Deposit'}</span>
              </div>
              {receiptRecord.notes && (
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-500">Reference / Notes</span>
                  <span className="font-bold text-gray-900">{receiptRecord.notes}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Gross Earnings</span>
                <span className="font-bold text-gray-900">{formatCurrency(receiptRecord.gross)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Deductions (18%)</span>
                <span className="font-bold text-red-500">-{formatCurrency(receiptRecord.deductions)}</span>
              </div>
              <div className="flex justify-between py-1 pt-2">
                <span className="font-black text-gray-900 text-sm">Disbursed Amount</span>
                <span className="font-black text-emerald-600 text-lg">{formatCurrency(receiptRecord.net)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="w-1/2 rounded-xl text-xs font-bold h-10 gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print Voucher
              </Button>
              <Button
                onClick={() => setIsReceiptModalOpen(false)}
                className="w-1/2 bg-[#1D4F6D] hover:bg-[#153a50] text-white rounded-xl text-xs font-bold h-10"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}