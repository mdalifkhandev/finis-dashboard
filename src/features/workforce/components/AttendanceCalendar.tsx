import { Calendar } from '@/shared/components/ui/Calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
export function AttendanceCalendar() {
  const events = [{
    date: new Date(2024, 6, 1),
    type: 'present',
    label: '8h'
  }, {
    date: new Date(2024, 6, 2),
    type: 'present',
    label: '8h'
  }, {
    date: new Date(2024, 6, 3),
    type: 'present',
    label: '8h'
  }, {
    date: new Date(2024, 6, 4),
    type: 'holiday',
    label: 'Holiday'
  }, {
    date: new Date(2024, 6, 5),
    type: 'present',
    label: '7.5h'
  }, {
    date: new Date(2024, 6, 8),
    type: 'present',
    label: '8h'
  }, {
    date: new Date(2024, 6, 9),
    type: 'absent',
    label: 'Absent'
  }, {
    date: new Date(2024, 6, 10),
    type: 'leave',
    label: 'Sick'
  }, {
    date: new Date(2024, 6, 11),
    type: 'present',
    label: '8h'
  }, {
    date: new Date(2024, 6, 12),
    type: 'present',
    label: '8h'
  }] as any[];
  return <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div className="lg:col-span-2">
      <Calendar events={events} className="h-full" />
    </div>
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">Present</span>
            </div>
            <span className="font-bold text-gray-900">18 days</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600">Absent</span>
            </div>
            <span className="font-bold text-gray-900">1 day</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-gray-600">Leave</span>
            </div>
            <span className="font-bold text-gray-900">2 days</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-600">Holiday</span>
            </div>
            <span className="font-bold text-gray-900">1 day</span>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                Attendance Rate
              </span>
              <span className="text-sm font-bold text-green-600">95%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-[95%]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="success" className="px-3 py-1 text-sm">
              Checked In
            </Badge>
            <span className="text-2xl font-bold text-gray-900">08:00 AM</span>
          </div>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Location: Skyline Tower - Site A</p>
            <p>Device: Mobile App (iPhone 13)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>;
}