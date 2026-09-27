import { useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { useGetPayrollDashboardQuery } from '@/store/payrollApi';
import { 
  DollarSign, 
  Receipt, 
  Calculator, 
  Briefcase, 
  TrendingUp, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck, 
  RefreshCw,
  FileText,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { formatCurrency } from '@/shared/utils';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface PayrollDashboardProps {
  onNavigateTab?: (tab: string) => void;
}

export function PayrollDashboard({ onNavigateTab }: PayrollDashboardProps) {
  const { data: dashboardData, isLoading, isFetching, refetch } = useGetPayrollDashboardQuery({});

  const summary = dashboardData?.summary || { 
    totalGrossPay: 0, 
    totalDeductions: 0, 
    totalNetPay: 0, 
    totalEmployerCost: 0,
    payrollPeriod: 'biweekly'
  };

  const currentPeriod = dashboardData?.currentPeriod;
  const deductionRates = dashboardData?.deductionRates;
  const employerRates = dashboardData?.employerRates;
  const recentRecords = dashboardData?.recentRecords || [];

  // Chart data formatting
  const chartData = useMemo(() => {
    if (dashboardData?.monthlyTrends && dashboardData.monthlyTrends.length > 0) {
      return dashboardData.monthlyTrends;
    }
    // Fallback if no historical months yet
    return [
      { month: "May '26", grossPay: 0, deductions: 0, netPay: 0 },
      { month: "Jun '26", grossPay: 0, deductions: 0, netPay: 0 },
      { month: "Jul '26", grossPay: 0, deductions: 0, netPay: 0 },
      { month: "Aug '26", grossPay: 0, deductions: 0, netPay: 0 },
      { month: "Sep '26", grossPay: summary.totalGrossPay, deductions: summary.totalDeductions, netPay: summary.totalNetPay },
    ];
  }, [dashboardData?.monthlyTrends, summary]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl shadow-xl border border-gray-100 text-xs space-y-1.5 min-w-[170px]">
          <p className="font-black text-gray-900 border-b border-gray-100 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex justify-between items-center gap-3">
              <span className="font-semibold text-gray-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </span>
              <span className="font-black text-gray-900">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-64 items-center justify-center gap-3">
        <div className="h-8 w-8 border-3 border-[#1D4F6D] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-gray-500">Loading Canadian payroll analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white rounded-2xl border border-blue-100/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#1D4F6D] text-white flex items-center justify-center shadow-sm">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900">Canadian Statutory Payroll Engine</h3>
            <p className="text-xs text-gray-500 font-medium">
              CRA Compliant • CPP (5.95%) • EI (1.66%) • Ontario Provincial Tax & WSIB
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 rounded-xl border-gray-200 text-xs font-bold text-gray-700 hover:bg-white gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-[#1D4F6D]' : ''}`} />
            Refresh
          </Button>

          {onNavigateTab && (
            <Button
              size="sm"
              onClick={() => onNavigateTab('settings')}
              className="h-9 px-3.5 rounded-xl bg-[#1D4F6D] hover:bg-[#153a50] text-white text-xs font-black gap-1.5 shadow-sm cursor-pointer"
            >
              <Sliders className="h-3.5 w-3.5" />
              Adjust Rates
            </Button>
          )}
        </div>
      </div>

      {/* 4 Financial Highlight Metric Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Gross Pay */}
        <Card className="border-gray-100 shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Gross Earnings</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#1D4F6D]">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900 tracking-tight">
              {formatCurrency(summary.totalGrossPay)}
            </div>
            <p className="text-[11px] text-gray-400 font-semibold mt-1 flex items-center gap-1">
              <span className="text-blue-600 font-bold">100%</span> Total employee base wages
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Total Deductions */}
        <Card className="border-gray-100 shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Deductions</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Receipt className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-rose-600 tracking-tight">
              {formatCurrency(summary.totalDeductions)}
            </div>
            <p className="text-[11px] text-gray-400 font-semibold mt-1">
              CPP, EI & Income Tax withheld
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Net Pay */}
        <Card className="border-gray-100 shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Net Disbursed</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600 tracking-tight">
              {formatCurrency(summary.totalNetPay)}
            </div>
            <p className="text-[11px] text-gray-400 font-semibold mt-1">
              Take-home pay payable to staff
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Employer Cost */}
        <Card className="border-gray-100 shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Employer Cost</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-purple-600 tracking-tight">
              {formatCurrency(summary.totalEmployerCost)}
            </div>
            <p className="text-[11px] text-gray-400 font-semibold mt-1">
              Includes CPP, EI, WSIB & Vacation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2 Column Details: Period Status & Formula Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Trends Chart */}
        <div className="lg:col-span-2">
          <Card className="border-gray-100 shadow-sm rounded-2xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-sm font-black text-gray-900 uppercase tracking-wider">
                  Payroll Financial Trends
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 mt-0.5">
                  Monthly progression of Gross Pay, Net Disbursements, and Statutory Deductions
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-bold bg-blue-50/50 text-[#1D4F6D] border-blue-100">
                Last 6 Months
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                      axisLine={{ stroke: '#E2E8F0' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle"
                      wrapperStyle={{ paddingBottom: 12, fontSize: 11, fontWeight: 700 }}
                    />
                    <Bar dataKey="grossPay" name="Gross Earnings" fill="#1D4F6D" radius={[6, 6, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="netPay" name="Net Disbursed" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="deductions" name="Deductions" fill="#F43F5E" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Active Period & Rate Formulas */}
        <div className="space-y-4">
          {/* Active Period Card */}
          <Card className="border-gray-100 shadow-sm rounded-2xl bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-[#1D4F6D]" />
                <span className="text-xs font-black text-gray-900 uppercase tracking-wider">Active Period</span>
              </div>
              <Badge 
                variant={currentPeriod?.status === 'Completed' ? 'success' : 'warning'} 
                className="text-[10px] font-black uppercase tracking-wider"
              >
                {currentPeriod?.status || 'In Progress'}
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50/70 rounded-xl space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase">Pay Date Range</p>
                <p className="font-black text-gray-900">
                  {currentPeriod?.period || 'Current Cycle'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-gray-50/70 rounded-xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Cycle</p>
                  <p className="font-bold text-gray-900 capitalize mt-0.5">
                    {summary.payrollPeriod || 'Bi-weekly'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50/70 rounded-xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Staff Count</p>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {currentPeriod?.workers ?? 1} worker(s)
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Statutory Rates Quick Tile */}
          <Card className="border-gray-100 shadow-sm rounded-2xl bg-white p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Statutory Rates</span>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('settings')}
                  className="text-[11px] font-bold text-[#1D4F6D] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  Edit <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-400">Federal Tax</p>
                <p className="font-black text-gray-900 mt-0.5">{deductionRates?.federalTax || '15.0%'}</p>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-400">Provincial Tax</p>
                <p className="font-black text-gray-900 mt-0.5">{deductionRates?.provincialTax || '5.05%'}</p>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-400">CPP (Employee)</p>
                <p className="font-black text-gray-900 mt-0.5">{deductionRates?.cppEmployee || '5.95%'}</p>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-400">EI (Employee)</p>
                <p className="font-black text-gray-900 mt-0.5">{deductionRates?.eiEmployee || '1.66%'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Processed Payroll Records Table */}
      <Card className="border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 py-4 px-6">
          <div>
            <CardTitle className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Recent Payroll Disbursement Records
            </CardTitle>
            <CardDescription className="text-xs text-gray-400 mt-0.5">
              Live payouts and draft records across all connected company workforces
            </CardDescription>
          </div>

          {onNavigateTab && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-bold rounded-xl h-9 border-gray-200 text-gray-700 hover:bg-gray-50 gap-1.5 cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-[#1D4F6D]" />
              Detailed Reports
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {recentRecords.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 font-medium">
              No recent payroll disbursement records found for this period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-gray-50/60 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Worker</th>
                    <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:table-cell">Pay Period</th>
                    <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Hours</th>
                    <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Gross Pay</th>
                    <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Deductions</th>
                    <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Net Pay</th>
                    <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {recentRecords.map((r: any, idx: number) => (
                    <tr key={r.payrollId || idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-[#1D4F6D] text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                            {(r.worker?.fullName || 'W').charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{r.worker?.fullName || 'Worker'}</p>
                            <p className="text-[10px] text-gray-400">{r.company?.name || r.worker?.department || 'Staff'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell text-gray-600 font-semibold">
                        {r.period}
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold text-gray-800">
                        {r.hours}h
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-gray-900">
                        {formatCurrency(r.grossPay)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-red-500">
                        -{formatCurrency(r.deductions)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-emerald-600">
                        {formatCurrency(r.netPay)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black ${
                          r.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {r.status === 'paid' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {r.status ? r.status.toUpperCase() : 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
