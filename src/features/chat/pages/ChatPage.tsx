import { useState, useMemo, useEffect, useCallback } from 'react';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatWindow } from '../components/ChatWindow';
import { useChatSocket } from '@/store/hooks/useChatSocket';
import {
    useGetAdminSupportMessagesQuery,
    useGetAdminChatMessagesQuery,
    useAdminStartSupportThreadMutation,
    useCloseThreadMutation,
    useLazyExportThreadQuery,
    Thread,
    Message,
} from '@/store/messageApi';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/authSlice';
import { ChatConversation, ChatMessage } from '@/shared/types/entities';

function adaptThread(thread: Thread): ChatConversation {
    const rawLast = thread.lastMessage as any;
    const lastMessage: ChatMessage | undefined = rawLast
        ? {
            id: rawLast.id ?? `last-${thread.id}`,
            conversationId: thread.id,
            senderId: rawLast.senderId ?? '',
            senderName: rawLast.sender?.fullName ?? '',
            senderRole: (rawLast.sender?.role ?? 'worker') as 'admin' | 'manager' | 'worker',
            senderAvatarUrl: rawLast.sender?.avatarUrl ?? null,
            content: rawLast.content ?? '',
            mediaUrl: rawLast.mediaUrl ?? null,
            mediaType: rawLast.mediaType ?? null,
            timestamp: rawLast.sentAt ?? rawLast.timestamp ?? '',
            read: rawLast.isRead ?? true,
        }
        : undefined;

    return {
        id: thread.id,
        type: thread.type as 'individual' | 'group' | 'project',
        name: thread.name,
        participants: thread.participants.map((p) => p.id),
        participantDetails: thread.participants.map((p) => ({
            id: p.id,
            fullName: p.fullName,
            avatarUrl: p.avatarUrl ?? null,
            role: p.role,
        })),
        unreadCount: thread.unreadCount,
        status: thread.isActive ? 'active' : 'closed',
        isBlocked: thread.isBlocked,
        blockedByMe: thread.blockedByMe,
        blockedByOther: thread.blockedByOther,
        createdAt: '',
        updatedAt: lastMessage?.timestamp ?? '',
        lastMessage,
    };
}

function adaptMessage(msg: Message): ChatMessage {
    return {
        id: msg.id,
        conversationId: msg.threadId,
        senderId: msg.senderId,
        senderName: msg.sender?.fullName ?? 'Unknown',
        senderRole: (msg.sender?.role ?? 'worker') as 'admin' | 'manager' | 'worker',
        senderAvatarUrl: msg.sender?.avatarUrl ?? null,
        content: msg.content ?? '',
        mediaUrl: msg.mediaUrl ?? null,
        mediaType: msg.mediaType ?? null,
        timestamp: msg.sentAt,
        read: msg.isRead,
    };
}

export function ChatPage() {
    const authUser = useAppSelector(selectAuthUser);
    const currentUser = authUser ?? { id: '', fullName: '', role: 'super_admin' };
    const MESSAGE_PAGE_LIMIT = 20;

    const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
    const [activeTab, setActiveTab] = useState<'support' | 'chat'>('support');
    const [liveMessages, setLiveMessages] = useState<Record<string, Message[]>>({});
    const [threadRefreshTick, setThreadRefreshTick] = useState(0);
    const [messagePage, setMessagePage] = useState(1);

    const selectedThreadId = selectedThread?.id ?? null;

    const { sendSocketMessage, markRead, notifySupportThreadCreated } = useChatSocket({
        activeThreadId: selectedThreadId,
        onMessage: (message) => {
            setThreadRefreshTick((current) => current + 1);
            setLiveMessages((prev) => {
                const existing = prev[message.threadId] ?? [];
                if (existing.some((item) => item.id === message.id)) return prev;
                return {
                    ...prev,
                    [message.threadId]: [...existing, message],
                };
            });

            setSelectedThread((current) => {
                if (!current || current.id !== message.threadId) return current;
                return {
                    ...current,
                    lastMessage: {
                        id: message.id,
                        conversationId: message.threadId,
                        senderId: message.senderId,
                        senderName: message.sender?.fullName ?? 'Unknown',
                        senderRole: (message.sender?.role ?? 'worker') as 'admin' | 'manager' | 'worker',
                        senderAvatarUrl: message.sender?.avatarUrl ?? null,
                        content: message.content ?? '',
                        mediaUrl: message.mediaUrl ?? null,
                        mediaType: message.mediaType ?? null,
                        sentAt: message.sentAt,
                        isRead: message.isRead,
                    },
                };
            });
        },
        onThreadUpdate: ({ threadId, lastMessage }) => {
            setThreadRefreshTick((current) => current + 1);
            setSelectedThread((current) => {
                if (!current || current.id !== threadId) return current;
                return {
                    ...current,
                    lastMessage: {
                        id: lastMessage.id,
                        conversationId: threadId,
                        senderId: lastMessage.senderId,
                        senderName: lastMessage.sender?.fullName ?? '',
                        senderRole: (lastMessage.sender?.role ?? 'worker') as 'admin' | 'manager' | 'worker',
                        senderAvatarUrl: lastMessage.sender?.avatarUrl ?? null,
                        content: lastMessage.content ?? '',
                        mediaUrl: lastMessage.mediaUrl ?? null,
                        mediaType: lastMessage.mediaType ?? null,
                        sentAt: lastMessage.sentAt,
                        isRead: lastMessage.isRead,
                    },
                };
            });
        },
        onReadReceipt: () => {
            setThreadRefreshTick((current) => current + 1);
        },
    });

    const { data: supportMessagesData, isFetching: isFetchingSupportMessages } = useGetAdminSupportMessagesQuery(
        selectedThreadId ? { threadId: selectedThreadId, page: messagePage, limit: MESSAGE_PAGE_LIMIT } : ({ threadId: '', page: 1, limit: MESSAGE_PAGE_LIMIT } as { threadId: string; page: number; limit: number }),
        { skip: !selectedThreadId || activeTab !== 'support' },
    );

    const { data: chatMessagesData, isFetching: isFetchingChatMessages } = useGetAdminChatMessagesQuery(
        selectedThreadId ? { threadId: selectedThreadId, page: messagePage, limit: MESSAGE_PAGE_LIMIT } : ({ threadId: '', page: 1, limit: MESSAGE_PAGE_LIMIT } as { threadId: string; page: number; limit: number }),
        { skip: !selectedThreadId || activeTab !== 'chat' },
    );

    const messagesData = activeTab === 'support' ? supportMessagesData : chatMessagesData;
    const isMessagesLoading = !messagesData && !!selectedThreadId;
    const isLoadingOlderMessages = (activeTab === 'support' ? isFetchingSupportMessages : isFetchingChatMessages) && messagePage > 1;
    const hasMoreMessages = !!messagesData?.meta?.totalPages && messagePage < messagesData.meta.totalPages;

    const [adminStartSupportThread] = useAdminStartSupportThreadMutation();
    const [closeThreadMutation] = useCloseThreadMutation();
    const [triggerExport] = useLazyExportThreadQuery();

    useEffect(() => {
        if (messagesData?.data && selectedThreadId) {
            setLiveMessages((prev) => {
                const existing = prev[selectedThreadId] ?? [];
                const incoming = messagesData.data;

                if (messagePage <= 1) {
                    return {
                        ...prev,
                        [selectedThreadId]: incoming,
                    };
                }

                const merged = [...incoming, ...existing];
                const unique = merged.filter((message, index, array) =>
                    array.findIndex((item) => item.id === message.id) === index,
                );

                return {
                    ...prev,
                    [selectedThreadId]: unique,
                };
            });
            markRead(selectedThreadId);
            setThreadRefreshTick((current) => current + 1);
        }
    }, [messagesData, selectedThreadId, markRead, messagePage]);

    useEffect(() => {
        setMessagePage(1);
    }, [selectedThreadId, activeTab]);

    const activeConversation = useMemo(
        () => (selectedThread ? adaptThread(selectedThread) : null),
        [selectedThread],
    );

    const activeMessages = useMemo(
        () => (selectedThreadId ? (liveMessages[selectedThreadId] ?? []) : []).map(adaptMessage),
        [liveMessages, selectedThreadId],
    );

    const isReadOnly = activeTab === 'chat'
        ? currentUser?.role === 'super_admin'
        : (selectedThread?.isReadOnly ?? false);
    const isBlocked = selectedThread?.isBlocked ?? false;

    const handleTabChange = useCallback((tab: 'support' | 'chat') => {
        setActiveTab(tab);
        setSelectedThread(null);
    }, []);

    const handleSelectThread = useCallback((thread: Thread) => {
        setSelectedThread(thread);
    }, []);

    const handleLoadOlderMessages = useCallback(() => {
        if (!selectedThreadId || !hasMoreMessages || isLoadingOlderMessages) return;
        setMessagePage((current) => current + 1);
    }, [selectedThreadId, hasMoreMessages, isLoadingOlderMessages]);

    const handleStartSupportThread = useCallback(
        async (userId: string) => {
            const thread = await adminStartSupportThread({ targetUserId: userId }).unwrap();
            notifySupportThreadCreated(thread.id);
            setActiveTab('support');
            setSelectedThread(thread);
        },
        [adminStartSupportThread, notifySupportThreadCreated],
    );

    const handleSendMessage = useCallback(
        async (content: string, mediaUrl?: string, mediaType?: string, locationUrl?: string) => {
            const payloadUrl = mediaUrl ?? locationUrl;
            if (!selectedThreadId || (!content.trim() && !payloadUrl) || isReadOnly) return;

            sendSocketMessage(selectedThreadId, content, payloadUrl, mediaType);
        },
        [selectedThreadId, isReadOnly, sendSocketMessage],
    );

    const handleCloseChat = useCallback(
        async (id: string) => {
            await closeThreadMutation(id);
        },
        [closeThreadMutation],
    );

    const handleExport = useCallback(
        async (id: string) => {
            const result = await triggerExport(id);
            if (!result.data) return;
            const messages = result.data as any[];
            const headers = ['Timestamp', 'Sender', 'Role', 'Content'];
            const rows = messages.map((m: any) => [
                m.sentAt, m.sender, m.role,
                `"${(m.content ?? '').replace(/"/g, '""')}"`,
            ]);
            const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `chat_export_${id}_${new Date().toISOString().split('T')[0]}.csv`;
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        [triggerExport],
    );

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6">
            <div className="w-[380px] h-full rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
                <ChatSidebar
                    selectedId={selectedThreadId}
                    onSelect={handleSelectThread}
                    onStartSupportThread={handleStartSupportThread}
                    currentUserId={currentUser.id}
                    currentUserRole={currentUser.role as 'admin' | 'super_admin'}
                    onTabChange={handleTabChange}
                    refreshSignal={threadRefreshTick}
                />
            </div>

            <div className="flex-1 h-full">
                {activeConversation ? (
                    <ChatWindow
                        conversation={activeConversation}
                        messages={activeMessages}
                        onSendMessage={handleSendMessage}
                        onCloseChat={handleCloseChat}
                        onExport={handleExport}
                        onLoadOlderMessages={handleLoadOlderMessages}
                        currentUserId={currentUser.id}
                        currentUserRole={currentUser.role as 'admin' | 'super_admin'}
                        isReadOnly={isReadOnly}
                        isBlocked={isBlocked}
                        isLoadingOlderMessages={isLoadingOlderMessages}
                        hasMoreMessages={hasMoreMessages}
                    />
                ) : (
                    <div className="h-full bg-white border border-gray-100 rounded-[24px] flex items-center justify-center text-gray-400 font-bold p-12 text-center">
                        <div>
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                <MessageSquareIcon className="w-8 h-8 text-gray-200" />
                            </div>
                            <p>Select a message to start<br />the conversation.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function MessageSquareIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round" className={className}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}
