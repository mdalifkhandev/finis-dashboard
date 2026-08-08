import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, Cell } from 'recharts';
import { Target, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import type { CompanyPerformanceResponse } from '@/store/companiesApi';

const fallbackMonthlyPerformance = [
    { month: 'Jan', compliance: 92, efficiency: 85, safety: 98 },
    { month: 'Feb', compliance: 95, efficiency: 88, safety: 97 },
    { month: 'Mar', compliance: 90, efficiency: 92, safety: 99 },
    { month: 'Apr', compliance: 94, efficiency: 90, safety: 98 },
    { month: 'May', compliance: 98, efficiency: 95, safety: 100 },
    { month: 'Jun', compliance: 96, efficiency: 94, safety: 99 },
];

const fallbackProjectStatusData = [
    { name: 'Completed', value: 142, color: '#10B981' },
    { name: 'In Progress', value: 12, color: '#1D4F6D' },
    { name: 'Delayed', value: 3, color: '#EF4444' },
    { name: 'Planning', value: 5, color: '#6366F1' },
];

interface CompanyPerformanceProps {
    performance?: CompanyPerformanceResponse | null;
}

export function CompanyPerformance({ performance }: CompanyPerformanceProps) {
    const monthlyPerformance = performance
        ? performance.charts.performanceTrends.labels.map((month, index) => ({
            month,
            efficiency: performance.charts.performanceTrends.series[0]?.data[index] ?? 0,
            compliance: performance.charts.performanceTrends.series[1]?.data[index] ?? 0,
        }))
        : fallbackMonthlyPerformance;

    const projectStatusData = performance
        ? performance.charts.projectDeliverySuccess.map((item, index) => ({
            name: item.label,
            value: item.value,
            color: ['#10B981', '#1D4F6D', '#EF4444', '#6366F1'][index] || '#94A3B8',
        }))
        : fallbackProjectStatusData;

    const summaryCards = performance
        ? [
            { label: 'Avg. Completion Rate', value: `${performance.cards.avgCompletionRate}%`, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Safety Compliance', value: `${performance.cards.safetyCompliance}%`, icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Worker Efficiency', value: `${performance.cards.workerEfficiency}%`, icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'MoM Growth', value: performance.cards.momGrowth, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ]
        : [
            { label: 'Avg. Completion Rate', value: '94.2%', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Safety Compliance', value: '98.5%', icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Worker Efficiency', value: '88.7%', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'MoM Growth', value: '+5.4%', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {summaryCards.map((stat, i) => (
                    <Card key={i} className="border-gray-100 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-gray-100 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-gray-50 bg-gray-50/30">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-[#1D4F6D]" />
                            Performance Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyPerformance}>
                                    <defs>
                                        <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1D4F6D" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#1D4F6D" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="efficiency"
                                        stroke="#1D4F6D"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorEfficiency)"
                                        name="Efficiency Index"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="compliance"
                                        stroke="#10B981"
                                        strokeWidth={3}
                                        fillOpacity={0}
                                        name="Compliance Rate"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-gray-50 bg-gray-50/30">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Target className="h-4 w-4 text-[#1D4F6D]" />
                            Project Delivery Success
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={projectStatusData} layout="vertical" margin={{ left: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }}
                                    />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                        {projectStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
