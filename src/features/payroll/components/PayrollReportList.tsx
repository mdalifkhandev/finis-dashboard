import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Download, Printer } from 'lucide-react';
import { useGeneratePayrollReportMutation } from '@/store/payrollApi';
import { formatCurrency } from '@/shared/utils';

export function PayrollReportList() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generateReport, { data: reportData, isLoading }] = useGeneratePayrollReportMutation();

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }
    try {
      await generateReport({ startDate, endDate }).unwrap();
    } catch (err: any) {
      alert('Failed to generate report: ' + (err.message || 'Unknown error'));
    }
  };

  const exportToCSV = () => {
    if (!reportData?.workers) return;
    
    const headers = [
      'Worker Name',
      'Role',
      'Total Hours',
      'Gross Pay',
      'Net Pay',
      'CPP Employee',
      'EI Employee',
      'Federal Tax',
      'Provincial Tax',
      'CPP Employer',
      'EI Employer',
      'WSIB',
      'Vacation Pay',
      'Total Employer Cost'
    ];
    
    const rows = reportData.workers.map(w => [
      w.workerName,
      w.role,
      w.totalHours,
      w.grossPay,
      w.netPay,
      w.deductions.cppEmployee,
      w.deductions.eiEmployee,
      w.deductions.federalTax,
      w.deductions.provincialTax,
      w.employerCosts.cppEmployer,
      w.employerCosts.eiEmployer,
      w.employerCosts.wsib,
      w.employerCosts.vacationPay,
      w.totalEmployerCost
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payroll-report-${startDate}-to-${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Select a date range to generate the payroll summary.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <Card id="printable-report">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Payroll Summary</CardTitle>
              <CardDescription>
                {new Date(reportData.startDate).toLocaleDateString()} to {new Date(reportData.endDate).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Total Gross Pay</p>
                <p className="text-lg font-bold">{formatCurrency(reportData.totalGrossPay)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Deductions</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(reportData.totalDeductions)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Net Pay</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(reportData.totalNetPay)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Employer Cost</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(reportData.totalEmployerCost)}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase">
                  <tr>
                    <th className="px-4 py-3">Worker</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3 text-right">Hours</th>
                    <th className="px-4 py-3 text-right">Gross Pay</th>
                    <th className="px-4 py-3 text-right">Deductions</th>
                    <th className="px-4 py-3 text-right">Net Pay</th>
                    <th className="px-4 py-3 text-right">Employer Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reportData.workers?.map((worker) => (
                    <tr key={worker.workerId} className="bg-white hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{worker.workerName}</td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{worker.role}</td>
                      <td className="px-4 py-3 text-right">{worker.totalHours}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(worker.grossPay)}</td>
                      <td className="px-4 py-3 text-right text-red-600">
                        {formatCurrency(worker.deductions?.total || 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">
                        {formatCurrency(worker.netPay)}
                      </td>
                      <td className="px-4 py-3 text-right text-blue-600">
                        {formatCurrency(worker.totalEmployerCost)}
                      </td>
                    </tr>
                  ))}
                  {(!reportData.workers || reportData.workers.length === 0) && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No payroll records found for this date range.
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
