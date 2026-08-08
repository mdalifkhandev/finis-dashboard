import { AlertCircle, CheckCircle2, Clock, Target, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { cn } from '@/shared/utils';

interface SegmentedIndicatorProps {
    activeFilter: string;
    taskIndicators?: {
        totalTasks: number;
        activeTasks: { value: number; change: number };
        completed: { value: number; change: number };
        efficiency: number;
        teamSize: number;
        onTimePct: number;
        atRisk: number;
    };
}

const formatChange = (value: number) => `${value >= 0 ? '+' : ''}${Math.abs(value)}%`;

export function SegmentedIndicator({ activeFilter, taskIndicators }: SegmentedIndicatorProps) {
    const data = taskIndicators ?? {
        totalTasks: 0,
        activeTasks: { value: 0, change: 0 },
        completed: { value: 0, change: 0 },
        efficiency: 0,
        teamSize: 0,
        onTimePct: 0,
        atRisk: 0,
    };

    const total = Math.max(
        data.totalTasks,
        data.activeTasks.value + data.completed.value,
    );

    const segments = [
        {
            label: 'Active Tasks',
            value: data.activeTasks.value,
            change: data.activeTasks.change,
            icon: Clock,
            accent: 'text-[#1D4F6D]',
            bar: 'bg-[#1D4F6D]',
            ring: 'ring-[#1D4F6D]/15',
        },
        {
            label: 'Completed',
            value: data.completed.value,
            change: data.completed.change,
            icon: CheckCircle2,
            accent: 'text-emerald-600',
            bar: 'bg-emerald-500',
            ring: 'ring-emerald-500/15',
        },
    ];

    return (
        <Card className="h-full border-gray-100 shadow-sm rounded-3xl transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
                <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                    Task Indicators
                </CardTitle>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
            </CardHeader>

            <CardContent className="flex flex-col gap-5 pt-6 pb-6">
                <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/60 p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em]">{activeFilter} view</p>
                            <h3 className="mt-2 text-3xl font-black text-gray-900 leading-none">{data.totalTasks || total}</h3>
                            <p className="mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Tasks</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em]">Efficiency</p>
                            <p className="mt-2 text-3xl font-black text-[#1D4F6D] leading-none">{data.efficiency}%</p>
                            <p className="mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">On Time {data.onTimePct}%</p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        {segments.map((segment) => {
                            const percent = total > 0 ? Math.round((segment.value / total) * 100) : 0;

                            return (
                                <div key={segment.label} className="rounded-2xl bg-white/80 border border-gray-100 p-3 shadow-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center bg-white shadow-sm ring-1', segment.ring)}>
                                                <segment.icon className={cn('h-4 w-4', segment.accent)} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{segment.label}</p>
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{segment.value} items</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={cn('text-[10px] font-black uppercase tracking-widest', segment.change >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                                                {formatChange(segment.change)}
                                            </p>
                                            <p className="text-xs font-black text-gray-900">{percent}%</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
                                        <div className={cn('h-full rounded-full transition-all duration-500', segment.bar)} style={{ width: `${percent}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-transparent border border-blue-100/50 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <Zap className="h-3.5 w-3.5 text-[#1D4F6D]" />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Efficiency</p>
                        </div>
                        <p className="text-2xl font-black text-[#1D4F6D]">{data.efficiency}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-transparent border border-gray-100/50 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <Users className="h-3.5 w-3.5 text-gray-600" />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Team Size</p>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{data.teamSize}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-transparent border border-emerald-100/50 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <Target className="h-3.5 w-3.5 text-emerald-600" />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">On Time</p>
                        </div>
                        <p className="text-2xl font-black text-emerald-600">{data.onTimePct}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-red-50 to-transparent border border-red-100/50 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">At Risk</p>
                        </div>
                        <p className="text-2xl font-black text-red-600">{data.atRisk}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
