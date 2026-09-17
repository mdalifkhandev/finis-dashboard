import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import type { DashboardActivityItem } from '@/shared/types';

interface ActivityFeedProps {
    activities?: DashboardActivityItem[];
}

const getBadgeClasses = (type: string) => {
    switch (type) {
        case 'task_completed':
            return 'bg-emerald-50 text-emerald-700';
        case 'payroll_approved':
            return 'bg-blue-50 text-[#1D4F6D]';
        case 'expense_flagged':
            return 'bg-amber-50 text-amber-700';
        default:
            return 'bg-gray-100 text-gray-600';
    }
};

const formatTime = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export function ActivityFeed({ activities = [] }: ActivityFeedProps) {
    return (
        <Card className="h-full border-gray-100 shadow-sm rounded-3xl overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-4 bg-gray-50/30">
                <CardTitle className="text-lg font-bold text-gray-900 tracking-tight">
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0">
                {activities.length > 0 ? (
                    <div className="space-y-6">
                        {activities.map((activity, index) => (
                            <div key={`${activity.type}-${activity.occurredAt}-${index}`} className="relative flex gap-4">
                                {index !== activities.length - 1 && (
                                    <div className="absolute left-5 top-10 h-full w-px bg-gray-100" />
                                )}
                                <Avatar className="h-10 w-10 border border-gray-100">
                                    <AvatarImage src={activity.actor?.avatarUrl ?? undefined} />
                                    <AvatarFallback>
                                        {activity.actor?.fullName?.charAt(0) ?? 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-medium text-gray-900 leading-5">
                                            {activity.actor?.fullName ?? 'User'}{' '}
                                            <span className="font-normal text-gray-500">
                                                {activity.description}
                                            </span>
                                        </p>
                                        <span className="shrink-0 text-xs text-gray-400">
                                            {formatTime(activity.occurredAt)}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm font-medium text-[#1D4F6D] truncate">
                                        {activity.subject}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                        {activity.project && (
                                            <Badge
                                                variant="secondary"
                                                className="bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            >
                                                {activity.project}
                                            </Badge>
                                        )}
                                        <Badge variant="secondary" className={getBadgeClasses(activity.type)}>
                                            {activity.type.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 px-4 py-10 text-center">
                        <p className="text-sm font-medium text-gray-500">No recent activity yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}