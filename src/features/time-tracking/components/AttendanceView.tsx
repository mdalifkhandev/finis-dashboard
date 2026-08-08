import { useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, Search } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import { Table, Column } from '@/shared/components/ui/Table';
import { Modal } from '@/shared/components/ui/Modal';
import { SuperAdminAttendanceRecord } from '@/shared/types';

type Props = {
    attendance: SuperAdminAttendanceRecord[];
    loading?: boolean;
    dateLabel?: string;
};

export function AttendanceView({ attendance, loading, dateLabel }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMapLocation, setSelectedMapLocation] = useState<{ lat: number, lng: number, workerName: string } | null>(null);

    const filteredAttendance = useMemo(() => attendance.filter((a) =>
        a.worker.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.worker.projectName ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
    ), [attendance, searchQuery]);

    const columns: Column<SuperAdminAttendanceRecord>[] = [
        {
            key: 'worker',
            header: 'Worker',
            sortable: true,
            render: (record) => (
                <div>
                    <div className="font-medium">{record.worker.fullName}</div>
                    <div className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</div>
                </div>
            )
        },
        {
            key: 'checkIn',
            header: 'Check-In',
            render: (record) => (
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{record.session?.checkInTime ? new Date(record.session.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                </div>
            )
        },
        {
            key: 'checkOut',
            header: 'Check-Out',
            render: (record) => (
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{record.session?.checkOutTime ? new Date(record.session.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ongoing'}</span>
                </div>
            )
        },
        {
            key: 'hoursWorked',
            header: 'Hours Worked',
            sortable: true,
            render: (record) => <span className="font-semibold">{record.totalHours.toFixed(2)}h</span>
        },
        {
            key: 'status',
            header: 'Status',
            render: (record) => <Badge variant={record.status === 'present' ? 'success' : record.status === 'late' ? 'warning' : 'destructive'}>{record.status.replace('_', ' ')}</Badge>
        },
        {
            key: 'location',
            header: 'GPS Location',
            render: (record) => record.session?.inLat && record.session?.inLng ? (
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedMapLocation({
                        lat: record.session!.inLat!,
                        lng: record.session!.inLng!,
                        workerName: record.worker.fullName
                    })}
                >
                    <MapPin className="w-4 h-4 mr-1" />
                    View Map
                </Button>
            ) : <span className="text-gray-400 text-sm">No Data</span>
        },
        {
            key: 'actions',
            header: 'Actions',
            render: () => (
                <Button size="sm" variant="outline">View Details</Button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Attendance Records</h2>
                    <p className="text-sm text-gray-600">Track worker check-in/out times and GPS locations{dateLabel ? ` for ${dateLabel}` : ''}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <Calendar className="w-4 h-4 mr-2" />
                        Select Date
                    </Button>
                    <Button variant="outline">Export Report</Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <Card className="p-6">
                    <div className="text-sm text-gray-600">Total Workers</div>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{attendance.length}</div>
                </Card>
                <Card className="p-6">
                    <div className="text-sm text-gray-600">Present</div>
                    <div className="text-3xl font-bold text-green-600 mt-2">{attendance.filter(a => a.status === 'present' || a.status === 'late').length}</div>
                </Card>
                <Card className="p-6">
                    <div className="text-sm text-gray-600">Late Arrivals</div>
                    <div className="text-3xl font-bold text-orange-600 mt-2">{attendance.filter(a => a.status === 'late').length}</div>
                </Card>
                <Card className="p-6">
                    <div className="text-sm text-gray-600">Absent</div>
                    <div className="text-3xl font-bold text-red-600 mt-2">{attendance.filter(a => a.status === 'absent').length}</div>
                </Card>
                <Card className="p-6">
                    <div className="text-sm text-gray-600">Total Hours</div>
                    <div className="text-3xl font-bold text-blue-600 mt-2">{attendance.reduce((sum, a) => sum + (a.totalHours ?? 0), 0).toFixed(1)}</div>
                </Card>
            </div>

            {/* Search */}
            <Card className="p-6">
                <Input
                    placeholder="Search by worker name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startIcon={<Search className="w-4 h-4" />}
                />
            </Card>

            {/* Attendance Table */}
            <Card>
                {loading ? (
                    <div className="p-6 text-sm text-gray-500">Loading attendance...</div>
                ) : (
                    <Table data={filteredAttendance} columns={columns} />
                )}
            </Card>

            {/* Map Modal */}
            <Modal
                isOpen={!!selectedMapLocation}
                onClose={() => setSelectedMapLocation(null)}
                title={`Location: ${selectedMapLocation?.workerName}`}
                maxWidth="2xl"
            >
                <div className="relative h-[400px] bg-slate-100 rounded-lg overflow-hidden border border-gray-200">
                    {/* Mock Map Background */}
                    <div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}
                    />

                    {/* Mock Map Pin */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                        <MapPin className="w-10 h-10 text-red-600 drop-shadow-lg" />
                        <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold mt-1">
                            {selectedMapLocation?.lat.toFixed(4)}, {selectedMapLocation?.lng.toFixed(4)}
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg border border-gray-200 text-sm text-gray-600 text-center">
                        This is a mock view. In production, this would render Google Maps or Mapbox centered on the coordinates.
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={() => setSelectedMapLocation(null)}>Close</Button>
                </div>
            </Modal>
        </div>
    );
}
