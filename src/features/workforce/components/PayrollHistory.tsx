import { Download, FileText } from 'lucide-react';
import { Table } from '@/shared/components/ui/Table';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { formatCurrency } from '@/shared/utils';
const payrollData = [{
  id: 1,
  period: 'Jul 1 - Jul 15, 2024',
  hours: 88,
  rate: 45,
  gross: 3960,
  deductions: 850,
  net: 3110,
  status: 'paid',
  date: 'Jul 16, 2024'
}, {
  id: 2,
  period: 'Jun 16 - Jun 30, 2024',
  hours: 80,
  rate: 45,
  gross: 3600,
  deductions: 780,
  net: 2820,
  status: 'paid',
  date: 'Jul 1, 2024'
}, {
  id: 3,
  period: 'Jun 1 - Jun 15, 2024',
  hours: 85,
  rate: 45,
  gross: 3825,
  deductions: 820,
  net: 3005,
  status: 'paid',
  date: 'Jun 16, 2024'
}];
export function PayrollHistory() {
  const columns = [{
    header: 'Pay Period',
    key: 'period',
    cell: (row: any) => <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
        <FileText className="h-4 w-4" />
      </div>
      <div>
        <p className="font-medium text-gray-900">{row.period}</p>
        <p className="text-xs text-gray-500">Paid on {row.date}</p>
      </div>
    </div>
  }, {
    header: 'Hours',
    key: 'hours',
    cell: (row: any) => <span className="text-gray-700">{row.hours}h</span>
  }, {
    header: 'Rate',
    key: 'rate',
    cell: (row: any) => <span className="text-gray-700">{formatCurrency(row.rate)}/h</span>
  }, {
    header: 'Gross Pay',
    key: 'gross',
    cell: (row: any) => <span className="font-medium text-gray-900">
      {formatCurrency(row.gross)}
    </span>
  }, {
    header: 'Net Pay',
    key: 'net',
    cell: (row: any) => <span className="font-bold text-green-600">
      {formatCurrency(row.net)}
    </span>
  }, {
    header: 'Status',
    key: 'status',
    cell: (row: any) => <Badge variant="success" className="capitalize">
      {row.status}
    </Badge>
  }, {
    header: '',
    key: 'actions',
    cell: () => <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
      <Download className="h-4 w-4" />
    </Button>
  }];
  return <div className="space-y-4">
    <div className="flex justify-end">
      <Button variant="outline" className="gap-2">
        <Download className="h-4 w-4" />
        Export All
      </Button>
    </div>
    <Table columns={columns} data={payrollData} />
  </div>;
}