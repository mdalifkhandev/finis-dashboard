import { useState, useMemo } from 'react';
import { Calendar, Clock, MapPin, Search, Filter, Download as DownloadIcon, Eye, CheckCircle2, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import { Table, Column } from '@/shared/components/ui/Table';
import { Select } from '@/shared/components/ui/Select';
import { mockAttendance } from '@/services/mock/mockData';
import { Attendance } from '@/shared/types';

export function AttendancePage() {
    const [attendance] = useState<Attendance[]>(mockAttendance);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    const filteredAttendance = useMemo(() => {
        return attendance.filter(a => {
            const matchesSearch = a.workerName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [attendance, searchQuery, statusFilter]);

    const stats = [
        { label: 'Total Present', value: '42', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Late Arrivals', value: '5', icon: AlertTriangle, color: 'text-primary', bg: 'bg-blue-50' },
        { label: 'Absence Rate', value: '2.4%', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Avg. Hours', value: '8.2h', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    ];

    const columns: Column<Attendance>[] = [
        {
            key: 'workerName',
            header: 'Worker Registry',
            render: (record: Attendance) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center text-[#1D4F6D] font-black text-xs">
                        {record.workerName.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 leading-tight">{record.workerName}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{record.date}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'checkIn',
            header: 'Check-In',
            render: (record: Attendance) => (
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm font-bold text-gray-700">{record.checkIn?.time || '--:--'}</span>
                </div>
            )
        },
        {
            key: 'checkOut',
            header: 'Check-Out',
            render: (record: Attendance) => (
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${record.checkOut ? 'bg-[#1D4F6D]' : 'bg-gray-300 animate-pulse'}`} />
                    <span className="text-sm font-bold text-gray-700">{record.checkOut?.time || 'In Progress'}</span>
                </div>
            )
        },
        {
            key: 'hoursWorked',
            header: 'Duration',
            render: (record: Attendance) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-black">
                    {record.hoursWorked.toFixed(1)} hrs
                </span>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (record: Attendance) => {
                const variants: Record<string, any> = {
                    present: 'success',
                    late: 'warning',
                    absent: 'destructive',
                    on_leave: 'secondary'
                };
                return (
                    <Badge variant={variants[record.status] || 'secondary'} className="font-black text-[10px] uppercase tracking-wider px-2 py-0.5">
                        {record.status.replace('_', ' ')}
                    </Badge>
                );
            }
        },
        {
            key: 'location',
            header: 'GPS Pin',
            render: (record: Attendance) => record.checkIn && (
                <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold rounded-lg px-2">
                    <MapPin className="w-3.5 h-3.5" />
                    View
                </Button>
            )
        },
        {
            key: 'actions',
            header: '',
            render: () => (
                <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#1D4F6D] hover:bg-blue-50">
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <PageHeader
                title="Attendance Tracking"
                description="Real-time monitoring of worker site arrivals and GPS verification"
                icon={Clock}
            >
                <Button variant="outline" className="h-10 px-4 border-gray-200 text-gray-600 font-bold rounded-xl gap-2">
                    <Calendar className="w-4 h-4" />
                    Today: {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Button>
                <Button className="h-10 px-4 bg-[#1D4F6D] hover:bg-[#163a50] text-white shadow-lg font-bold rounded-xl gap-2">
                    <DownloadIcon className="w-4 h-4" />
                    Export Log
                </Button>
            </PageHeader>

            {/* View & Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1 border-gray-100 shadow-sm rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-widest">Time Frame</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {(['daily', 'weekly', 'monthly'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setView(t)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm",
                                    view === t ? "bg-[#1D4F6D] text-white shadow-md scale-105" : "text-gray-500 hover:bg-gray-50"
                                )}
                            >
                                <span className="capitalize">{t} Log</span>
                                {view === t && <CheckCircle2 className="h-4 w-4" />}
                            </button>
                        ))}
                    </CardContent>
                </Card>

                <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <Card key={i} className="border-gray-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow cursor-default group">
                            <CardContent className="p-6">
                                <div className={`h-10 w-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                                    <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#1D4F6D] transition-colors" />
                    <Input
                        placeholder="Search workers by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 border-gray-100 bg-gray-50/50 focus:bg-white transition-all rounded-xl shadow-none"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Select
                        placeholder="All Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full md:w-48 h-11 border-gray-100 bg-gray-50/50 focus:bg-white transition-all rounded-xl"
                        options={[
                            { label: 'All Attendance', value: 'all' },
                            { label: 'Present', value: 'present' },
                            { label: 'Late Arrival', value: 'late' },
                            { label: 'Absent', value: 'absent' },
                            { label: 'On Leave', value: 'on_leave' },
                        ]}
                    />
                    <Button variant="outline" className="h-11 px-5 border-gray-200 text-gray-600 font-bold rounded-xl gap-2 whitespace-nowrap">
                        <Filter className="w-4 h-4" />
                        Filters
                    </Button>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden pb-4">
                <div className="p-6 flex items-center justify-between border-b border-gray-50">
                    <h2 className="text-lg font-black text-[#1D4F6D] uppercase tracking-tighter">Attendance Register</h2>
                    <Badge variant="secondary" className="font-bold underline">LIVE SYNC</Badge>
                </div>
                <Table data={filteredAttendance} columns={columns} className="border-none" />
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
