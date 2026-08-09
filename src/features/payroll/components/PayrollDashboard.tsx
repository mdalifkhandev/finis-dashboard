import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { useGetPayrollDashboardQuery } from '@/store/payrollApi';
import { DollarSign, Receipt, Calculator, Briefcase } from 'lucide-react';
import { formatCurrency } from '@/shared/utils';

export function PayrollDashboard() {
  const { data: dashboardData, isLoading } = useGetPayrollDashboardQuery({});

  if (isLoading) {
    return <div className="flex h-32 items-center justify-center">Loading...</div>;
  }

  const summary = dashboardData?.summary || { totalGrossPay: 0, totalDeductions: 0, totalNetPay: 0, totalEmployerCost: 0 };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Gross Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalGrossPay)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Deductions</CardTitle>
            <Receipt className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalDeductions)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Net Pay</CardTitle>
            <Briefcase className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalNetPay)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Employer Cost</CardTitle>
            <Calculator className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalEmployerCost)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center text-gray-400 border border-dashed rounded-lg">
            [Chart Placeholder: Monthly Trends]
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
