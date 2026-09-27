import { useState, useMemo } from 'react';
import { Calendar } from '@/shared/components/ui/Calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Clock, MapPin, CheckCircle2, XCircle, AlertCircle, CalendarDays } from 'lucide-react';
import { formatTimeAMPM } from '@/shared/utils/helpers';

interface AttendanceCalendarProps {
  worker?: any;
}

export function AttendanceCalendar({ worker }: AttendanceCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const attendances: any[] = worker?.attendances || [];

  // Map real attendances into CalendarEvent objects
  const events = useMemo(() => {
    return attendances.map((att: any) => {
      const d = new Date(att.date);
      const session = att.sessions?.[0];
      const hours = att.totalHours ?? session?.hoursWorked;
      const label = hours ? `${hours.toFixed(1)}h` : (session?.checkInTime ? 'Present' : '');

      let type: 'present' | 'absent' | 'leave' | 'holiday' = 'present';
      const statusLower = (att.status || '').toLowerCase();
      if (statusLower === 'absent') type = 'absent';
      else if (statusLower === 'leave') type = 'leave';
      else if (statusLower === 'holiday') type = 'holiday';

      return {
        date: d,
        type,
        label,
      };
    });
  }, [attendances]);

  // Aggregate stats across recorded history
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let holiday = 0;

    attendances.forEach((att: any) => {
      const s = (att.status || '').toLowerCase();
      if (s === 'absent') absent++;
      else if (s === 'leave') leave++;
      else if (s === 'holiday') holiday++;
      else present++;
    });

    const total = attendances.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 100;

    return { present, absent, leave, holiday, total, rate };
  }, [attendances]);

  // Check today's status
  const todayStr = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }, []);

  const todayRecord = useMemo(() => {
    return attendances.find((att: any) => {
      const attDateStr = new Date(att.date).toISOString().split('T')[0];
      return attDateStr === todayStr;
    });
  }, [attendances, todayStr]);

  const todaySession = todayRecord?.sessions?.[0];

  // Selected date details
  const selectedDateStr = useMemo(() => {
    return `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  }, [selectedDate]);

  const selectedRecord = useMemo(() => {
    return attendances.find((att: any) => {
      const attDateStr = new Date(att.date).toISOString().split('T')[0];
      return attDateStr === selectedDateStr;
    });
  }, [attendances, selectedDateStr]);

  const selectedSession = selectedRecord?.sessions?.[0];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Calendar Grid */}
      <div className="lg:col-span-2 space-y-6">
        <Calendar
          events={events}
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="h-full"
        />

        {/* Selected Date Details Card */}
        <Card className="border-gray-100 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#1D4F6D]" />
                <CardTitle className="text-sm font-bold text-gray-900">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                </CardTitle>
              </div>
              {selectedRecord ? (
                <Badge
                  variant={selectedRecord.status === 'present' ? 'success' : selectedRecord.status === 'late' ? 'warning' : 'secondary'}
                  className="font-bold uppercase text-[10px]"
                >
                  {selectedRecord.status}
                </Badge>
              ) : (
                <span className="text-xs text-gray-400 font-medium">No record</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {selectedRecord ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Check-In</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {selectedSession?.checkInTime
                      ? formatTimeAMPM(new Date(selectedSession.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
                      : '--:--'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Check-Out</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {selectedSession?.checkOutTime
                      ? formatTimeAMPM(new Date(selectedSession.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
                      : (selectedSession?.checkInTime ? 'In Progress' : '--:--')}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hours Logged</p>
                  <p className="text-sm font-bold text-[#1D4F6D] mt-1">
                    {((selectedRecord.totalHours ?? selectedSession?.hoursWorked) ?? 0).toFixed(1)} hrs
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Project / Site</p>
                  <p className="text-sm font-bold text-gray-900 mt-1 truncate" title={selectedSession?.project?.name || worker?.assignedProject || 'Main Site'}>
                    {selectedSession?.project?.name || worker?.assignedProject || 'Main Site'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-gray-400 font-medium">
                No attendance logs found for this specific date. Click any date on the calendar to view details.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Side Summaries */}
      <div className="space-y-6">
        {/* Today's Status Card */}
        <Card className="border-gray-100 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-gray-50 pb-3">
            <CardTitle className="text-xs font-black text-[#1D4F6D] uppercase tracking-widest">Today's Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <Badge
                variant={todayRecord && todayRecord.status !== 'absent' ? 'success' : 'secondary'}
                className="px-3 py-1 font-bold text-xs uppercase"
              >
                {todaySession?.checkOutTime
                  ? 'Checked Out'
                  : todaySession?.checkInTime
                  ? 'Checked In'
                  : 'Not Recorded'}
              </Badge>
              <span className="text-xl font-black text-gray-900">
                {todaySession?.checkInTime
                  ? formatTimeAMPM(new Date(todaySession.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
                  : '--:--'}
              </span>
            </div>

            <div className="space-y-2 text-xs text-gray-500 pt-2 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate">
                  {todaySession?.project?.name || worker?.assignedProject || 'Main Site'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span>
                  {todaySession?.hoursWorked ? `${todaySession.hoursWorked.toFixed(1)} hrs today` : 'Real-time tracking active'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aggregate Attendance Summary Card */}
        <Card className="border-gray-100 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-gray-50 pb-3">
            <CardTitle className="text-xs font-black text-[#1D4F6D] uppercase tracking-widest">Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm font-semibold text-gray-600">Present</span>
              </div>
              <span className="font-bold text-gray-900">{stats.present} days</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm font-semibold text-gray-600">Absent</span>
              </div>
              <span className="font-bold text-gray-900">{stats.absent} day{stats.absent !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-sm font-semibold text-gray-600">Leave</span>
              </div>
              <span className="font-bold text-gray-900">{stats.leave} day{stats.leave !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm font-semibold text-gray-600">Holiday</span>
              </div>
              <span className="font-bold text-gray-900">{stats.holiday} day{stats.holiday !== 1 ? 's' : ''}</span>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Attendance Rate
                </span>
                <span className="text-sm font-black text-green-600">{stats.rate}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.rate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}