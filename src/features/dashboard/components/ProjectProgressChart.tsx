import { AlertTriangle, Award, Info, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import type { DashboardFilter, DashboardStatsResponse } from '@/shared/types';

interface ProjectProgressChartProps {
    filter?: DashboardFilter;
    forecast?: DashboardStatsResponse['projectCompletionForecast'];
}

const periodLabels: Record<DashboardFilter, string> = {
    today: 'Today',
    weekly: 'This Week',
    monthly: 'This Month',
    yearly: 'This Year',
    custom: 'Custom Range',
};

export function ProjectProgressChart({ filter = 'monthly', forecast }: ProjectProgressChartProps) {
    const data = Array.isArray(forecast?.data) ? forecast.data : [];
    const hasData = data.length > 0;

    const maxValue = hasData ? Math.max(...data.map((entry) => entry?.completionPct ?? 0)) : 0;
    const minValue = hasData ? Math.min(...data.map((entry) => entry?.completionPct ?? 0)) : 0;
    const bestMonth = forecast?.bestMonth
        ? data.find((_, index) => index + 1 === forecast.bestMonth?.month)?.month ?? `Month ${forecast.bestMonth.month}`
        : hasData
            ? data.find((entry) => entry?.completionPct === maxValue)?.month ?? 'Peak'
            : 'No data';

    const periodLabel = periodLabels[filter];
    const overallCompletion = typeof forecast?.overallCompletion === 'number' ? forecast.overallCompletion : 0;
    const avgCompletion = typeof forecast?.avgCompletion === 'number' ? forecast.avgCompletion : 0;

    return (
        <Card className="col-span-2 h-full border-gray-100 shadow-sm rounded-3xl overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
                <div className="flex-1">
                    <CardTitle className="text-xl font-black text-gray-900 tracking-tight">
                        Project Completion Forecast
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-3xl font-black text-[#1D4F6D]">{overallCompletion.toFixed(1)}%</span>
                        <span className="text-[10px] font-bold text-green-700 flex items-center bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {forecast ? '+ backend data' : 'loading data'}
                        </span>
                    </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1 p-3 sm:p-0 bg-blue-50/50 sm:bg-transparent rounded-xl sm:rounded-none">
                    <div className="flex items-center gap-2 text-xs">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span className="font-bold text-gray-600">
                            Best: <span className="text-gray-900 font-black">{bestMonth}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <TrendingUp className="h-4 w-4 text-[#1D4F6D]" />
                        <span className="font-bold text-gray-600">
                            Avg: <span className="text-gray-900 font-black">{avgCompletion.toFixed(1)}%</span>
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4 px-6 pb-4">
                <div className="relative flex mb-4">
                    <div className="flex items-center justify-center -rotate-90 origin-center absolute -left-6 top-[45%] -translate-y-1/2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                            Completion %
                        </span>
                    </div>

                    <div className="flex-1 ml-2">
                        <ResponsiveContainer width="100%" height={300}>
                            {hasData ? (
                                <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="month"
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
                                    cursor={{ fill: 'transparent' }}
                                    animationDuration={200}
                                    animationEasing="ease-out"
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-xl bg-white p-4 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                                        {payload[0].payload.month}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-[#1D4F6D]" />
                                                        <span className="font-black text-2xl text-gray-900">
                                                            {payload[0].payload.completionPct}%
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="completionPct" radius={[6, 6, 6, 6]} barSize={32}>
                                    {data.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill="url(#activeGradient)"
                                            className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                                        />
                                    ))}
                                </Bar>
                                <defs>
                                    <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#2A6B92" />
                                        <stop offset="100%" stopColor="#1D4F6D" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                            ) : (
                                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 px-6 text-center">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-600">No forecast data available for this period.</p>
                                        <p className="mt-1 text-xs text-gray-400">Switch the filter or wait for the backend response.</p>
                                    </div>
                                </div>
                            )}
                        </ResponsiveContainer>

                        <div className="flex items-center justify-center mt-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {periodLabel}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-transparent border border-emerald-100/50 text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Peak Value</p>
                        <p className="text-2xl font-black text-emerald-600">{maxValue}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-transparent border border-blue-100/50 text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Trend</p>
                        <p className="text-lg font-black text-[#1D4F6D]">{periodLabel}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-red-50 to-transparent border border-red-100/50 text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Low Point</p>
                        <p className="text-2xl font-black text-red-600">{minValue}%</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                        <div className="h-8 w-8 rounded-lg bg-[#1D4F6D] flex items-center justify-center shrink-0">
                            <Info className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-black text-[#1D4F6D] mb-1">Chart Analysis - {periodLabel}</p>
                            <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                                Backend data drives this chart directly, so the bars reflect the current dashboard period without client-side mock values.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                        <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                            <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-black text-emerald-700 mb-1">Key Insight</p>
                            <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                                Highest completion landed at <span className="font-black text-gray-700">{bestMonth}</span> with {maxValue}% completion.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50">
                        <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-black text-amber-700 mb-1">Action Recommended</p>
                            <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                                Use the strongest period as the baseline for planning the next delivery window.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}