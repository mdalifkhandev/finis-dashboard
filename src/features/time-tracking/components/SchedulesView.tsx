import { useState } from 'react';
import { Plus, Calendar, Users, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Schedule } from '@/shared/types';

export function SchedulesView() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

    const getDayNames = (days: number[]) => {
        const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days.map(d => dayMap[d]).join(', ');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Work Schedules</h2>
                    <p className="text-sm text-gray-600">Manage standard shifts and working hours</p>
                </div>
                <Button onClick={() => { setSelectedSchedule(null); setIsModalOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Schedule
                </Button>
            </div>

            {schedules.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-700">No Work Schedules</h3>
                    <p className="text-sm text-gray-400 mt-1">Create a shift schedule to assign workers and set working hours.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {schedules.map(schedule => (
                        <Card key={schedule.id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            {schedule.name}
                                            <Badge variant="outline" className="ml-2">
                                                {schedule.startTime} - {schedule.endTime}
                                            </Badge>
                                        </h3>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{getDayNames(schedule.workDays)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                <span>{schedule.assignedWorkers.length} workers assigned</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" onClick={() => { setSelectedSchedule(schedule); setIsModalOpen(true); }}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50"
                                        onClick={() => setSchedules(prev => prev.filter(s => s.id !== schedule.id))}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedSchedule ? 'Edit Schedule' : 'Create New Schedule'}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Name</label>
                        <Input placeholder="e.g. Morning Shift" defaultValue={selectedSchedule?.name} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <Input type="time" defaultValue={selectedSchedule?.startTime || '09:00'} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <Input type="time" defaultValue={selectedSchedule?.endTime || '17:00'} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => setIsModalOpen(false)}>Save Schedule</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
