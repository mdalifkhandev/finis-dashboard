import { Card } from '@/shared/components/ui/Card';
import { Table, Column } from '@/shared/components/ui/Table';
import { Button } from '@/shared/components/ui/Button';
import { Star, AlertCircle } from 'lucide-react';
import { mockWorkers, mockAttendance, mockTasks } from '@/services/mock/mockData';

interface PerformanceRecord {
    id: string;
    workerName: string;
    role: string;
    attendanceRate: number; // percentage of on-time check-ins
    tasksCompleted: number;
    tasksPending: number;
    rating: number; // 1-5
}

export function PerformanceReport() {
    // derive performance stats
    const performanceData: PerformanceRecord[] = mockWorkers.map(worker => {
        const workerAttendance = mockAttendance.filter(a => a.workerId === worker.id);
        const totalDays = workerAttendance.length || 1;

        const lateDays = workerAttendance.filter(a => a.status === 'late').length;
        const attendanceRate = Math.round(((totalDays - lateDays) / totalDays) * 100);

        const workerTasks = mockTasks.filter(t => t.assignedTo?.includes(worker.id));
        const completed = workerTasks.filter(t => t.status === 'completed').length;
        const pending = workerTasks.filter(t => t.status !== 'completed').length;

        // Mock rating algo
        let rating = 3.0;
        if (attendanceRate > 90) rating += 1;
        if (completed > 2) rating += 1;
        if (lateDays > 0) rating -= 0.5;

        return {
            id: worker.id,
            workerName: worker.name,
            role: worker.role,
            attendanceRate: attendanceRate,
            tasksCompleted: completed,
            tasksPending: pending,
            rating: Math.min(5, Math.max(1, rating))
        };
    });

    const columns: Column<PerformanceRecord>[] = [
        {
            key: 'workerName',
            header: 'Worker',
            sortable: true,
            render: (record) => (
                <div>
                    <div className="font-medium">{record.workerName}</div>
                    <div className="text-xs text-gray-500">{record.role}</div>
                </div>
            )
        },
        {
            key: 'attendanceRate',
            header: 'Attendance Score',
            sortable: true,
            render: (record) => (
                <div className="flex items-center gap-2">
                    <span className={`font-bold ${record.attendanceRate < 80 ? 'text-red-600' : 'text-green-600'}`}>
                        {record.attendanceRate}%
                    </span>
                    {record.attendanceRate < 80 && <AlertCircle className="w-3 h-3 text-red-500" />}
                </div>
            )
        },
        {
            key: 'tasksCompleted',
            header: 'Tasks Done',
            sortable: true,
            render: (record) => <span className="font-medium">{record.tasksCompleted}</span>
        },
        {
            key: 'rating',
            header: 'Performance Rating',
            sortable: true,
            render: (record) => (
                <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-bold text-gray-900">{record.rating.toFixed(1)}</span>
                </div>
            )
        },
        {
            key: 'actions',
            header: 'Details',
            render: () => (
                <Button size="sm" variant="outline">View Profile</Button>
            )
        }
    ];

    return (
        <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-900">Worker Performance</h3>
                <p className="text-sm text-gray-500">Efficiency and reliability metrics</p>
            </div>
            <Table data={performanceData} columns={columns} />
        </Card>
    );
}
