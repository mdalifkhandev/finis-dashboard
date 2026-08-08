import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import {
    useGetUserChatThreadsQuery,
    useGetUserSupportThreadQuery,
    useSearchUsersForSupportQuery,
    useGetAdminSupportThreadsQuery,
    useGetAdminChatThreadsQuery,
    Thread,
} from '@/store/messageApi';
import { cn } from '@/shared/utils';
import { getFullUrl } from '@/shared/utils/helpers';

interface ChatSidebarProps {
    selectedId: string | null;
    onSelect: (thread: Thread) => void;
    onStartSupportThread?: (userId: string) => void;
    currentUserId: string;
    currentUserRole: 'admin' | 'manager' | 'worker' | 'super_admin';
    onTabChange?: (tab: 'support' | 'chat') => void;
    refreshSignal?: number;
}

function Avatar({ user }: { user: { fullName: string; avatarUrl?: string | null } }) {
    const avatarSrc = getFullUrl(user.avatarUrl ?? undefined);
    if (avatarSrc) {
        return <img src={avatarSrc} alt={user.fullName} className="w-14 h-14 rounded-full object-cover" />;
    }
    const initials = user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    return <div className="w-14 h-14 rounded-full bg-[#4A7FA5] flex items-center justify-center text-white font-bold text-lg">{initials}</div>;
}

function formatTime(dateStr: string) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getThreadSortTime(thread: Thread) {
    const lastMessageTime = thread.lastMessage?.sentAt ? new Date(thread.lastMessage.sentAt).getTime() : 0;
    return Number.isFinite(lastMessageTime) ? lastMessageTime : 0;
}

function sortThreadsByLatestActivity(threads: Thread[]) {
    return [...threads].sort((a, b) => {
        const unreadDiff = (b.unreadCount ?? 0) - (a.unreadCount ?? 0);
        if (unreadDiff !== 0) return unreadDiff;

        const messageDiff = getThreadSortTime(b) - getThreadSortTime(a);
        if (messageDiff !== 0) return messageDiff;

        return 0;
    });
}

function ThreadItem({
    thread,
    isSelected,
    onSelect,
    currentUserId,
}: {
    thread: Thread;
    isSelected: boolean;
    onSelect: () => void;
    currentUserId: string;
}) {
    const others = thread.participants.filter((p) => p.id !== currentUserId);
    const displayName =
        thread.type === 'direct'
            ? (others.map((p) => p.fullName).filter(Boolean).join(', ') || thread.name || 'Unknown')
            : (thread.name ?? 'Unknown');
    const avatarUser = others[0] ?? thread.participants[0];
    const lastContent = thread.lastMessage?.content ?? '';
    const lastTime = thread.lastMessage?.sentAt ? formatTime(thread.lastMessage.sentAt) : '';
    const unread = thread.unreadCount ?? 0;

    return (
        <div
            onClick={onSelect}
            className={cn(
                'flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors border-b border-gray-100',
                isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50',
            )}
        >
            <div className="relative shrink-0">
                <Avatar user={{ fullName: displayName, avatarUrl: avatarUser?.avatarUrl }} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 text-[15px] truncate">{displayName}</span>
                    {lastTime && <span className="text-[#4A7FA5] text-xs font-medium ml-2 shrink-0">{lastTime}</span>}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                    <p className="text-gray-400 text-sm truncate flex-1">{lastContent || 'No messages yet'}</p>
                    {unread > 0 && (
                        <span className="ml-2 shrink-0 bg-[#4A7FA5] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function ThreadSkeleton() {
    return (
        <div className="flex flex-col gap-0">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 animate-pulse">
                    <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-gray-200 rounded w-2/3" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function UserSidebar({
    activeTab,
    search,
    selectedId,
    onSelect,
    currentUserId,
}: {
    activeTab: 'support' | 'chat';
    search: string;
    selectedId: string | null;
    onSelect: (thread: Thread) => void;
    currentUserId: string;
}) {
    const { data: chatData, isLoading: chatLoading } = useGetUserChatThreadsQuery(
        { search: search || undefined },
        { skip: activeTab !== 'chat' },
    );
    const { data: supportData, isLoading: supportLoading } = useGetUserSupportThreadQuery(undefined, { skip: activeTab !== 'support' });

    const isLoading = activeTab === 'chat' ? chatLoading : supportLoading;
    const threads = sortThreadsByLatestActivity(
        activeTab === 'chat' ? (chatData?.data ?? []) : (supportData?.data ? [supportData.data] : []),
    );

    if (isLoading) return <ThreadSkeleton />;

    if (threads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs mt-1 text-gray-300">{activeTab === 'support' ? 'No support thread' : 'No chat threads'}</p>
            </div>
        );
    }

    return (
        <>
            {threads.map((thread) => (
                <ThreadItem
                    key={thread.id}
                    thread={thread}
                    isSelected={selectedId === thread.id}
                    onSelect={() => onSelect(thread)}
                    currentUserId={currentUserId}
                />
            ))}
        </>
    );
}

function AdminSidebar({
    activeTab,
    search,
    selectedId,
    onSelect,
    onStartSupportThread,
    supportView,
    currentUserId,
    refreshSignal,
}: {
    activeTab: 'support' | 'chat';
    search: string;
    selectedId: string | null;
    onSelect: (thread: Thread) => void;
    onStartSupportThread?: (userId: string) => void;
    supportView: 'threads' | 'users';
    currentUserId: string;
    refreshSignal?: number;
}) {
    const searchMode = activeTab === 'support' && supportView === 'users';

    const { data: supportUsers, isLoading: supportUsersLoading } = useSearchUsersForSupportQuery(
        { search: search || undefined },
        { skip: !searchMode },
    );
    const { data: supportData, isLoading: supportLoading, refetch: refetchSupportThreads } = useGetAdminSupportThreadsQuery(
        { search: search || undefined },
        { skip: activeTab !== 'support' || searchMode },
    );
    const { data: chatData, isLoading: chatLoading, refetch: refetchChatThreads } = useGetAdminChatThreadsQuery(
        { search: search || undefined },
        { skip: activeTab !== 'chat' },
    );

    useEffect(() => {
        if (!refreshSignal) return;
        if (activeTab === 'support' && !searchMode) void refetchSupportThreads();
        if (activeTab === 'chat') void refetchChatThreads();
    }, [activeTab, refreshSignal, refetchSupportThreads, refetchChatThreads, searchMode]);

    const isLoading = activeTab === 'support' ? (searchMode ? supportUsersLoading : supportLoading) : chatLoading;
    const threads = sortThreadsByLatestActivity(
        activeTab === 'support' ? (searchMode ? [] : (supportData?.data ?? [])) : (chatData?.data ?? []),
    );

    if (isLoading) return <ThreadSkeleton />;

    if (searchMode) {
        const users = supportUsers ?? [];
        if (users.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <p className="text-sm font-medium">No users found</p>
                    <p className="text-xs mt-1 text-gray-300">Try a different name or email</p>
                </div>
            );
        }

        return (
            <>
                {users.map((user) => (
                    <div
                        key={user.id}
                        onClick={() => onStartSupportThread?.(user.id)}
                        className={cn('flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors border-b border-gray-100', 'bg-white hover:bg-gray-50')}
                    >
                        <div className="relative shrink-0">
                            <Avatar user={{ fullName: user.fullName, avatarUrl: user.avatarUrl }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900 text-[15px] truncate">{user.fullName}</span>
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                                <p className="text-gray-400 text-sm truncate flex-1">{user.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </>
        );
    }

    if (threads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs mt-1 text-gray-300">{activeTab === 'support' ? 'No support threads' : 'No chat threads'}</p>
            </div>
        );
    }

    return (
        <>
            {threads.map((thread) => (
                <ThreadItem
                    key={thread.id}
                    thread={thread}
                    isSelected={selectedId === thread.id}
                    onSelect={() => onSelect(thread)}
                    currentUserId={currentUserId}
                />
            ))}
        </>
    );
}

export function ChatSidebar({
    selectedId,
    onSelect,
    onStartSupportThread,
    currentUserId,
    currentUserRole,
    onTabChange,
    refreshSignal,
}: ChatSidebarProps) {
    const [activeTab, setActiveTab] = useState<'support' | 'chat'>('support');
    const [search, setSearch] = useState('');
    const [supportView, setSupportView] = useState<'threads' | 'users'>('threads');

    const isSuperAdmin = currentUserRole === 'super_admin';

    const handleTabChange = (tab: 'support' | 'chat') => {
        setActiveTab(tab);
        setSupportView('threads');
        setSearch('');
        onTabChange?.(tab);
    };

    const showUsers = activeTab === 'support' && supportView === 'users';

    return (
        <div className="h-full flex flex-col bg-[#F2F5F8]">
            <div className="px-4 pt-4 pb-3 bg-[#F2F5F8]">
                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-sm">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search by name"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            if (activeTab === 'support') setSupportView('users');
                        }}
                        onFocus={() => {
                            if (activeTab === 'support') setSupportView('users');
                        }}
                        className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
                    />
                    {isSuperAdmin && activeTab === 'support' && (
                        <button
                            type="button"
                            onClick={() => setSupportView((current) => (current === 'users' ? 'threads' : 'users'))}
                            className={cn(
                                'shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors',
                                showUsers ? 'bg-[#2D5F82] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                            )}
                        >
                            All Users
                        </button>
                    )}
                </div>
            </div>
            <div className="px-4 pb-3 bg-[#F2F5F8]">
                <div className="flex gap-2">
                    <button onClick={() => handleTabChange('support')} className={cn('flex-1 py-3 rounded-2xl text-sm font-semibold transition-all', activeTab === 'support' ? 'bg-[#2D5F82] text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100')}>
                        Support
                    </button>
                    <button onClick={() => handleTabChange('chat')} className={cn('flex-1 py-3 rounded-2xl text-sm font-semibold transition-all', activeTab === 'chat' ? 'bg-[#2D5F82] text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100')}>
                        Chat
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-white rounded-t-3xl shadow-inner">
                {isSuperAdmin ? (
                    <AdminSidebar
                        activeTab={activeTab}
                        search={search}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        onStartSupportThread={onStartSupportThread}
                        supportView={supportView}
                        currentUserId={currentUserId}
                        refreshSignal={refreshSignal}
                    />
                ) : (
                    <UserSidebar
                        activeTab={activeTab}
                        search={search}
                        selectedId={selectedId}
                        onSelect={onSelect}
                        currentUserId={currentUserId}
                    />
                )}
            </div>
        </div>
    );
}
