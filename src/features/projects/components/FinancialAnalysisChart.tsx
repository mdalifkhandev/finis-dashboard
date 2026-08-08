import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';

type FinancialAnalysisChartProps = {
    budget: number;
    spent: number;
    remaining: number;
};

export function FinancialAnalysisChart({ budget, spent, remaining }: FinancialAnalysisChartProps) {
    const safeBudget = Math.max(budget || 0, 0);
    const safeSpent = Math.max(spent || 0, 0);
    const safeRemaining = Math.max(remaining || Math.max(safeBudget - safeSpent, 0), 0);
    const usedPercent = safeBudget > 0 ? Math.min(100, Math.round((safeSpent / safeBudget) * 100)) : 0;
    const chartData = [
        { name: 'Spent', value: safeSpent },
        { name: 'Remaining', value: safeRemaining },
    ];
    const barData = [
        { name: 'Budget', budget: safeBudget, actual: safeSpent },
    ];
    const pieColors = ['#1D4F6D', '#E5E7EB'];

    return (
        <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between py-4">
                <div>
                    <CardTitle className="text-lg font-bold text-gray-900">Financial Analysis</CardTitle>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Current budget usage for this project</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-[#1D4F6D]"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actual</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-gray-200"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Budget</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F9FAFB' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length >= 2) {
                                            return (
                                                <div className="bg-white p-3 shadow-xl rounded-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{payload[0].payload.name}</p>
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="h-2 w-2 rounded-full bg-[#1D4F6D]" />
                                                                <span className="text-xs font-medium text-gray-600">Actual:</span>
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-900">${(payload[0].value as number).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="h-2 w-2 rounded-full bg-gray-300" />
                                                                <span className="text-xs font-medium text-gray-600">Budget:</span>
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-900">${(payload[1].value as number).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="actual" fill="#1D4F6D" radius={[4, 4, 0, 0]} barSize={24} />
                                <Bar dataKey="budget" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-gray-50/40 p-4">
                        <div className="h-[180px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={2}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={entry.name} fill={pieColors[index]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => `$${value.toLocaleString()}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Budget Used</span>
                                <span className="text-sm font-extrabold text-gray-900">{usedPercent}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                                <div className="h-full rounded-full bg-[#1D4F6D]" style={{ width: `${usedPercent}%` }} />
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="rounded-xl bg-white p-3 border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Budget</p>
                                    <p className="text-lg font-black text-gray-900">${safeBudget.toLocaleString()}</p>
                                </div>
                                <div className="rounded-xl bg-white p-3 border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Spent</p>
                                    <p className="text-lg font-black text-gray-900">${safeSpent.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
