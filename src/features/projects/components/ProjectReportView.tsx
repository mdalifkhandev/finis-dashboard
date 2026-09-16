import { Project } from '@/shared/types';
import { Table, Column } from '@/shared/components/ui/Table';
import { Badge } from '@/shared/components/ui/Badge';
import { Building2, Calendar, DollarSign, CheckSquare } from 'lucide-react';

interface ProjectReportViewProps {
    project: Project;
}

interface ReportTaskRow {
    id: string;
    location: string;
    taskName: string;
    worker: string;
    value: string;
    status: string;
    priority: string;
}

export function ProjectReportView({ project }: ProjectReportViewProps) {
    // Flatten structure to a table of tasks
    const taskRows: ReportTaskRow[] = [];

    // 1. Process project level tasks
    project.tasks?.forEach(task => {
        taskRows.push({
            id: task.id,
            location: 'Project Level',
            taskName: task.name,
            worker: task.assignedTo?.join(', ') || 'Unassigned',
            value: task.internalValue ? `$${task.internalValue.toLocaleString()}` : '-',
            status: task.status,
            priority: (task as any).priority || 'medium'
        });
    });

    // 2. Process floors/sections and their tasks
    project.floors.forEach(floor => {
        // Floor level tasks
        floor.tasks?.forEach(task => {
            taskRows.push({
                id: task.id,
                location: floor.name,
                taskName: task.name,
                worker: task.assignedTo?.join(', ') || 'Unassigned',
                value: task.internalValue ? `$${task.internalValue.toLocaleString()}` : '-',
                status: task.status,
                priority: (task as any).priority || 'medium'
            });
        });

        // Unit level tasks
        floor.rooms.forEach(room => {
            room.tasks?.forEach(task => {
                taskRows.push({
                    id: task.id,
                    location: `${floor.name} - ${room.name}`,
                    taskName: task.name,
                    worker: task.assignedTo?.join(', ') || 'Unassigned',
                    value: task.internalValue ? `$${task.internalValue.toLocaleString()}` : '-',
                    status: task.status,
                    priority: (task as any).priority || 'medium'
                });
            });
        });
    });

    const columns: Column<ReportTaskRow>[] = [
        {
            key: 'location',
            header: 'Location',
            sortable: true,
            className: 'w-[200px]'
        },
        {
            key: 'taskName',
            header: 'Task Name',
            sortable: true,
            className: 'font-bold'
        },
        {
            key: 'worker',
            header: 'Assigned Worker',
            sortable: true
        }
    ];

    if (project.hasBudget) {
        columns.push({
            key: 'value',
            header: 'Internal Value',
            sortable: true
        });
    }

    columns.push({
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (row) => (
            <Badge variant={row.status === 'completed' ? 'success' : row.status === 'active' ? 'default' : 'secondary'}>
                {row.status}
            </Badge>
        )
    });

    return (
        <div className="space-y-8 p-8 bg-white border rounded-3xl print:p-0 print:border-0 print:shadow-none">
            {/* Report Header */}
            <div className="flex justify-between items-start border-b pb-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{project.name} - Project Report</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> {project.companyName}</div>
                        <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Generated: {new Date().toLocaleDateString()}</div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Project Status</p>
                    <Badge className="px-4 py-1.5 text-sm uppercase">{project.status}</Badge>
                </div>
            </div>

            {/* Key Metrics Table */}
            <div className={`grid gap-4 ${project.hasBudget ? 'grid-cols-4' : 'grid-cols-3'}`}>
                {project.hasBudget && (
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Total Budget
                        </p>
                        <p className="text-xl font-bold text-gray-900">${project.budget.toLocaleString()}</p>
                    </div>
                )}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <CheckSquare className="h-3 w-3" /> Completion
                    </p>
                    <p className="text-xl font-bold text-green-600">{project.progress}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Sub-Tasks</p>
                    <p className="text-xl font-bold text-gray-900">{taskRows.length}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Completed</p>
                    <p className="text-xl font-bold text-blue-600">{taskRows.filter(t => t.status === 'completed').length}</p>
                </div>
            </div>

            {/* Main Data Table */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Comprehensive Sub-Task List</h3>
                <Table
                    data={taskRows}
                    columns={columns}
                    className="border-none shadow-none"
                />
            </div>

            {/* Footer */}
            <div className="pt-12 border-t text-center text-xs text-gray-400">
                <p>FinisPro Admin Dashboard - System Generated Report</p>
                <p className="mt-1">Page 1 of 1</p>
            </div>
        </div>
    );
}
