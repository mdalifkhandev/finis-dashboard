import { Bell, CheckCheck, BellRing, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { useNotifications } from '@/shared/hooks/useNotifications';

function getBadgeClass(type: string) {
  switch (type) {
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'warning':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'error':
      return 'bg-rose-50 text-rose-700 border-rose-100';
    default:
      return 'bg-blue-50 text-[#1D4F6D] border-blue-100';
  }
}

function getIcon(type: string) {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'error':
      return <BellRing className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader
        title="Notifications"
        description="Live alerts for projects, companies, payroll, and system activity"
        icon={Bell}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
            {unreadCount} unread
          </div>
          <Button
            onClick={markAllAsRead}
            variant="outline"
            className="gap-2 border-[#1D4F6D]/15 text-[#1D4F6D] hover:bg-[#1D4F6D]/5"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_0.9fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
            <CardDescription>
              {loading ? 'Loading notifications...' : 'Tap a notification to mark it as read.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
                  <Bell className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">No notifications yet</p>
                <p className="mt-1 text-xs text-gray-400">New company, project, payroll and support alerts will appear here.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={async () => {
                    if (!notification.read) {
                      await markAsRead(notification.id);
                    }
                    if (notification.link) {
                      navigate(notification.link);
                    }
                  }}
                  className={`w-full text-left rounded-2xl border p-4 transition-all hover:shadow-sm ${notification.read ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-gray-100 hover:border-[#1D4F6D]/20'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${getBadgeClass(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="truncate text-sm font-bold text-gray-900">{notification.title}</h4>
                        <span className="whitespace-nowrap text-xs font-semibold text-gray-400">{notification.timestamp}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                    </div>
                    {!notification.read && <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#1D4F6D]" />}
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>Where your alerts are delivered.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="font-medium text-gray-700">In-app inbox</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Active</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="font-medium text-gray-700">Websocket live updates</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Active</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="font-medium text-gray-700">Mobile push</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Device token required</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What you’ll get</CardTitle>
              <CardDescription>Super admin focused alert types.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>• New company created with company name</p>
              <p>• New project created with project and company name</p>
              <p>• User invitation, approval and system activity</p>
              <p>• Payroll, geofencing and task notifications</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
