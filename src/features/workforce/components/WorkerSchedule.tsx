import { Card, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const shifts = [
    { day: 'Mon', date: 'Oct 23', start: '08:00', end: '16:00', project: 'Skyline Tower', role: 'Site Manager', status: 'completed' },
    { day: 'Tue', date: 'Oct 24', start: '08:00', end: '16:00', project: 'Skyline Tower', role: 'Site Manager', status: 'completed' },
    { day: 'Wed', date: 'Oct 25', start: '08:00', end: '16:00', project: 'Skyline Tower', role: 'Site Manager', status: 'upcoming' },
    { day: 'Thu', date: 'Oct 26', start: '08:00', end: '16:00', project: 'Lakeside Towers', role: 'Consultant', status: 'upcoming' },
    { day: 'Fri', date: 'Oct 27', start: '08:00', end: '16:00', project: 'Lakeside Towers', role: 'Consultant', status: 'upcoming' },
];

export function WorkerSchedule() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-gray-900">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2 px-2">
                        <CalendarIcon className="h-4 w-4 text-[#1D4F6D]" />
                        <span className="font-bold text-gray-900">Oct 23 - Oct 29, 2023</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-gray-900">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <Button className="gap-2 bg-[#1D4F6D] hover:bg-[#163a50] text-white shadow-md font-bold px-6 h-11">
                    <Plus className="h-4 w-4" />
                    Assign New Shift
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weekDays.map((day, i) => (
                    <div key={day} className="space-y-3">
                        <div className="text-center py-2 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{day}</p>
                            <p className="text-lg font-bold text-[#1D4F6D]">{23 + i}</p>
                        </div>

                        {shifts.filter(s => s.day === day).map((shift, idx) => (
                            <Card key={idx} className={`border-l-4 ${shift.status === 'completed' ? 'border-l-green-500' : 'border-l-blue-500'} shadow-sm overflow-hidden group hover:shadow-md transition-all cursor-pointer`}>
                                <CardContent className="p-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                            <Clock className="h-3 w-3" />
                                            {shift.start} - {shift.end}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-black text-gray-900 group-hover:text-[#1D4F6D] transition-colors line-clamp-1">{shift.project}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{shift.role}</p>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500">
                                        <MapPin className="h-3 w-3" />
                                        Main Site
                                    </div>

                                    <Badge variant={shift.status === 'completed' ? 'success' : 'secondary'} className="w-full justify-center text-[10px] py-0.5">
                                        {shift.status}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}

                        {shifts.filter(s => s.day === day).length === 0 && (
                            <div className="h-32 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 bg-gray-50/50">
                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">Off Day</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
