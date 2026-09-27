import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import { 
  Download, 
  FileText, 
  Printer, 
  Calendar, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useGeneratePayrollReportMutation } from '@/store/payrollApi';
import { formatCurrency } from '@/shared/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PayrollReportWorker {
  payrollId?: string;
  workerId: string;
  workerName: string;
  role?: string;
  status?: string;
  totalHours?: number;
  grossPay?: number;
  netPay?: number;
  deductions?: {
    cppEmployee?: string;
    eiEmployee?: string;
    federalTax?: string;
    provincialTax?: string;
    total?: number;
  };
  employerCosts?: {
    cppEmployer?: string;
    eiEmployer?: string;
    wsib?: string;
    vacationPay?: string;
    total?: number;
  };
  totalEmployerCost?: number;
}

export function PayrollReportList() {
  // Default to current month
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01`;
  });
  
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(lastDay).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const [generateReport, { data: reportData, isLoading }] = useGeneratePayrollReportMutation();

  // Run automatically on mount with initial dates
  useEffect(() => {
    if (startDate && endDate) {
      generateReport({ startDate, endDate });
    }
  }, []);

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }
    try {
      await generateReport({ startDate, endDate }).unwrap();
    } catch (err: any) {
      alert('Failed to generate report: ' + (err?.data?.message || err?.message || 'Unknown error'));
    }
  };

  // Quick Date Preset Selectors
  const setPreset = (type: 'thisMonth' | 'lastMonth' | 'last30Days' | 'ytd') => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    if (type === 'thisMonth') {
      const s = `${y}-${String(m + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(y, m + 1, 0).getDate();
      const e = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      setStartDate(s);
      setEndDate(e);
      generateReport({ startDate: s, endDate: e });
    } else if (type === 'lastMonth') {
      const lastMonthDate = new Date(y, m - 1, 1);
      const ly = lastMonthDate.getFullYear();
      const lm = lastMonthDate.getMonth();
      const s = `${ly}-${String(lm + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(ly, lm + 1, 0).getDate();
      const e = `${ly}-${String(lm + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      setStartDate(s);
      setEndDate(e);
      generateReport({ startDate: s, endDate: e });
    } else if (type === 'last30Days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      const s = thirtyDaysAgo.toISOString().split('T')[0];
      const e = now.toISOString().split('T')[0];
      setStartDate(s);
      setEndDate(e);
      generateReport({ startDate: s, endDate: e });
    } else if (type === 'ytd') {
      const s = `${y}-01-01`;
      const e = now.toISOString().split('T')[0];
      setStartDate(s);
      setEndDate(e);
      generateReport({ startDate: s, endDate: e });
    }
  };

  // Extract workers safely
  const workers: PayrollReportWorker[] = (reportData?.workers ?? (reportData as any)?.records ?? []) as PayrollReportWorker[];

  const totalGross = reportData?.totalGrossPay ?? reportData?.summary?.totalGrossPay ?? 0;
  const totalDeductions = reportData?.totalDeductions ?? reportData?.summary?.totalDeductions ?? 0;
  const totalNet = reportData?.totalNetPay ?? reportData?.summary?.totalNetPay ?? 0;
  const totalEmployerCost = reportData?.totalEmployerCost ?? reportData?.summary?.totalEmployerCost ?? 0;

  // Safe date formatter
  const formatDateDisplay = (dateString?: string | Date) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return String(dateString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return String(dateString);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!workers || workers.length === 0) {
      alert('No payroll records found to export.');
      return;
    }
    
    const headers = [
      'Worker Name',
      'Role / Department',
      'Status',
      'Total Hours',
      'Gross Pay ($)',
      'Total Deductions ($)',
      'Net Pay ($)',
      'Employer Cost ($)'
    ];
    
    const rows = workers.map((w: PayrollReportWorker) => [
      `"${w.workerName || 'Worker'}"`,
      `"${w.role || 'Staff'}"`,
      `"${(w.status || 'paid').toUpperCase()}"`,
      w.totalHours ?? 0,
      (w.grossPay ?? 0).toFixed(2),
      (w.deductions?.total ?? 0).toFixed(2),
      (w.netPay ?? 0).toFixed(2),
      (w.totalEmployerCost ?? 0).toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: (string | number)[]) => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payroll_summary_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF using jsPDF and autoTable
  const exportToPDF = () => {
    if (!workers || workers.length === 0) {
      alert('No payroll records found to generate PDF.');
      return;
    }

    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Top Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 75, 'F');

    // Title & Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('FINIS WORKFORCE PAYROLL SUMMARY', 40, 36);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text(`Official Payroll Report | Reporting Period: ${startDate} to ${endDate}`, 40, 56);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, pageWidth - 40, 56, { align: 'right' });

    // Summary Statistics Cards / Boxes
    const startY = 95;
    const boxWidth = (pageWidth - 80 - 30) / 4;
    const boxHeight = 55;

    const stats = [
      { label: 'TOTAL GROSS PAY', value: `$${totalGross.toFixed(2)}`, color: [15, 23, 42] },
      { label: 'TOTAL DEDUCTIONS', value: `$${totalDeductions.toFixed(2)}`, color: [220, 38, 38] },
      { label: 'TOTAL NET DISBURSED', value: `$${totalNet.toFixed(2)}`, color: [16, 185, 129] },
      { label: 'TOTAL EMPLOYER COST', value: `$${totalEmployerCost.toFixed(2)}`, color: [2, 132, 199] },
    ];

    stats.forEach((st, idx) => {
      const x = 40 + idx * (boxWidth + 10);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, startY, boxWidth, boxHeight, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(st.label, x + 8, startY + 18);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(st.color[0], st.color[1], st.color[2]);
      doc.text(st.value, x + 8, startY + 40);
    });

    // Table Data
    const tableData = workers.map((w: PayrollReportWorker) => [
      w.workerName || 'Worker',
      w.role || 'Staff',
      (w.status || 'paid').toUpperCase(),
      `${w.totalHours ?? 0} hrs`,
      `$${(w.grossPay ?? 0).toFixed(2)}`,
      `-$${(w.deductions?.total ?? 0).toFixed(2)}`,
      `$${(w.netPay ?? 0).toFixed(2)}`,
      `$${(w.totalEmployerCost ?? 0).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 170,
      head: [[
        'Worker Name', 
        'Department / Role', 
        'Status', 
        'Hours', 
        'Gross Pay', 
        'Deductions', 
        'Net Pay', 
        'Employer Cost'
      ]],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'left',
      },
      styles: {
        fontSize: 8,
        cellPadding: 5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 100 },
        1: { cellWidth: 80 },
        2: { halign: 'center', cellWidth: 55 },
        3: { halign: 'right', cellWidth: 45 },
        4: { halign: 'right', cellWidth: 55 },
        5: { halign: 'right', cellWidth: 60 },
        6: { halign: 'right', fontStyle: 'bold', cellWidth: 60 },
        7: { halign: 'right', cellWidth: 60 },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      foot: [[
        'Total Summary',
        `${workers.length} Workers`,
        '-',
        '-',
        `$${totalGross.toFixed(2)}`,
        `-$${totalDeductions.toFixed(2)}`,
        `$${totalNet.toFixed(2)}`,
        `$${totalEmployerCost.toFixed(2)}`
      ]],
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 8,
      },
      margin: { left: 40, right: 40 },
    });

    // Page Numbering Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'FINIS Payroll Engine • CRA Compliant Canadian Payroll Record',
        40,
        doc.internal.pageSize.getHeight() - 25
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - 40,
        doc.internal.pageSize.getHeight() - 25,
        { align: 'right' }
      );
    }

    doc.save(`payroll_report_${startDate}_to_${endDate}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selection & Quick Filters Card */}
      <Card className="border-border/60 shadow-sm print:hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Generate Payroll Report
              </CardTitle>
              <CardDescription>
                Select custom date bounds or quick presets to filter disbursements and taxes.
              </CardDescription>
            </div>
            
            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs font-medium px-2.5"
                onClick={() => setPreset('thisMonth')}
              >
                This Month
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs font-medium px-2.5"
                onClick={() => setPreset('lastMonth')}
              >
                Last Month
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs font-medium px-2.5"
                onClick={() => setPreset('last30Days')}
              >
                Last 30 Days
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs font-medium px-2.5"
                onClick={() => setPreset('ytd')}
              >
                Year to Date
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end bg-muted/20 p-4 rounded-xl border border-border/40">
            <div className="space-y-1.5 flex-1 w-full">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Start Date
              </label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5 flex-1 w-full">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                End Date
              </label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="bg-background"
              />
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={isLoading}
              className="w-full sm:w-auto px-6 h-10 gap-2 shrink-0 font-medium"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary Card */}
      {reportData && (
        <Card className="border-border/60 shadow-sm" id="printable-report">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4 border-b border-border/40">
            <div>
              <div className="flex items-center gap-2.5">
                <CardTitle className="text-xl">Payroll Statement Summary</CardTitle>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                  {workers.length} {workers.length === 1 ? 'Record' : 'Records'}
                </Badge>
              </div>
              <CardDescription className="mt-1 flex items-center gap-1.5 text-xs">
                <span>Period:</span>
                <span className="font-semibold text-foreground">
                  {formatDateDisplay(startDate)}
                </span>
                <ArrowRight className="h-3 w-3 inline text-muted-foreground" />
                <span className="font-semibold text-foreground">
                  {formatDateDisplay(endDate)}
                </span>
              </CardDescription>
            </div>
            
            {/* Export Buttons */}
            <div className="flex items-center gap-2.5 print:hidden">
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToCSV}
                className="gap-2 h-9 text-xs font-medium border-border/80 hover:bg-muted"
                disabled={workers.length === 0}
              >
                <Download className="h-4 w-4 text-emerald-600" /> 
                Export CSV
              </Button>
              <Button 
                variant="default"
                size="sm"
                onClick={exportToPDF}
                className="gap-2 h-9 text-xs font-medium shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={workers.length === 0}
              >
                <FileText className="h-4 w-4" /> 
                Download PDF
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Top Stat Summary Cards */}
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Gross Pay
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(totalGross)}
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40">
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Total Deductions
                </p>
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                  {formatCurrency(totalDeductions)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Total Net Disbursed
                </p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatCurrency(totalNet)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-900/40">
                <p className="text-xs font-medium text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  Total Employer Cost
                </p>
                <p className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">
                  {formatCurrency(totalEmployerCost)}
                </p>
              </div>
            </div>

            {/* Table of Workers */}
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider border-b border-border/60">
                  <tr>
                    <th className="px-4 py-3">Worker Name</th>
                    <th className="px-4 py-3">Role / Department</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Hours</th>
                    <th className="px-4 py-3 text-right">Gross Pay</th>
                    <th className="px-4 py-3 text-right">Deductions</th>
                    <th className="px-4 py-3 text-right">Net Pay</th>
                    <th className="px-4 py-3 text-right">Employer Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {workers.map((worker: PayrollReportWorker) => (
                    <tr key={worker.payrollId || worker.workerId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-foreground">
                        {worker.workerName || 'Worker'}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground capitalize">
                        {worker.role || 'Staff'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge 
                          variant="outline" 
                          className={
                            worker.status === 'paid' 
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200 text-[10px] font-semibold uppercase' 
                              : 'bg-amber-500/10 text-amber-600 border-amber-200 text-[10px] font-semibold uppercase'
                          }
                        >
                          {worker.status || 'paid'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right text-muted-foreground font-mono">
                        {worker.totalHours ?? 0}h
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-foreground">
                        {formatCurrency(worker.grossPay ?? 0)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-rose-600 font-medium">
                        -{formatCurrency(worker.deductions?.total ?? 0)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-emerald-600 font-bold">
                        {formatCurrency(worker.netPay ?? 0)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-sky-600 font-medium">
                        {formatCurrency(worker.totalEmployerCost ?? 0)}
                      </td>
                    </tr>
                  ))}
                  {workers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileText className="h-8 w-8 text-muted-foreground/40" />
                          <p className="font-medium text-sm">No payroll records found for this date range.</p>
                          <p className="text-xs text-muted-foreground/80">Try selecting a different date range or preset.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

