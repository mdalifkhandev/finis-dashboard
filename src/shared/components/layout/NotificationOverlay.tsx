import { Bell, CheckCircle2, AlertTriangle, Info, XCircle, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Notification } from '@/shared/types';
import { cn } from '@/shared/utils';

interface NotificationOverlayProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onNotificationClick?: (notification: Notification) => void;
    onClose: () => void;
}

export function NotificationOverlay({ notifications, onMarkAsRead, onMarkAllAsRead, onNotificationClick }: NotificationOverlayProps) {
    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
            case 'error': return <XCircle className="h-4 w-4 text-rose-600" />;
            default: return <Info className="h-4 w-4 text-[#1D4F6D]" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="absolute right-0 top-[calc(100%+14px)] w-[min(92vw,400px)] bg-white rounded-3xl shadow-[0_24px_64px_-16px_rgba(0,0,0,0.18)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[100]">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-b from-gray-50/70 to-white">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[#1D4F6D] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-900/10">
                            <Bell className="h-4.5 w-4.5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-gray-900 leading-none">Notifications</h3>
                            <p className="mt-1 text-[11px] text-gray-400 font-semibold">{unreadCount} unread entries</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMarkAllAsRead}
                        className="text-[10px] font-black uppercase tracking-widest text-[#1D4F6D] hover:bg-blue-50/50 h-8 px-3 rounded-xl shrink-0"
                    >
                        Mark All
                    </Button>
                </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto custom-scrollbar px-3 py-3">
                {notifications.length === 0 ? (
                    <div className="py-14 text-center">
                        <div className="h-14 w-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="h-6 w-6 text-gray-200" />
                        </div>
                        <p className="text-[11px] font-bold text-gray-400">Inbox is clear</p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "min-h-[78px] rounded-2xl border border-gray-100 px-4 py-3.5 flex gap-3 cursor-pointer transition-all relative overflow-hidden",
                                    notification.read ? "bg-gray-50/60 opacity-70" : "bg-white hover:border-[#1D4F6D]/20 hover:shadow-[0_10px_30px_-20px_rgba(29,79,109,0.35)]"
                                )}
                                onClick={() => {
                                    if (!notification.read) onMarkAsRead(notification.id);
                                    onNotificationClick?.(notification);
                                }}
                            >
                                <div className={cn(
                                    "h-10 w-10 rounded-2xl flex flex-shrink-0 items-center justify-center shadow-sm border border-transparent transition-all group-hover:scale-105",
                                    notification.type === 'success' ? "bg-emerald-50" :
                                        notification.type === 'warning' ? "bg-amber-50" :
                                            notification.type === 'error' ? "bg-rose-50" : "bg-blue-50"
                                )}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <div className="flex items-start justify-between gap-3 mb-1">
                                        <p className="text-[12px] font-black text-gray-900 truncate leading-snug">{notification.title}</p>
                                        <span className="text-[9px] font-bold text-gray-300 whitespace-nowrap uppercase tracking-tighter pt-0.5">{notification.timestamp}</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed line-clamp-2">{notification.message}</p>
                                </div>
                                {!notification.read && (
                                    <div className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#1D4F6D] shadow-[0_0_6px_rgba(29,79,109,0.3)]" />
                                )}
                                {notification.read && (
                                    <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-all">
                                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-50/60">
                <Button
                    className="w-full h-11 bg-white border border-gray-100 text-[#1D4F6D] font-bold text-[10px] rounded-2xl shadow-sm hover:shadow-md hover:bg-white transition-all gap-2"
                >
                    System Activity Logs
                    <ArrowRight className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}
