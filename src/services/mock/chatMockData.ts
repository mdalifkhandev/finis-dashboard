import { ChatConversation, ChatMessage } from '@/shared/types/entities';

export const mockChatConversations: ChatConversation[] = [
    {
        id: 'conv-1',
        type: 'individual',
        name: 'John Doe (Manager)',
        participants: ['admin-1', 'mng-1'],
        unreadCount: 2,
        status: 'active',
        createdAt: '2026-01-10T10:00:00Z',
        updatedAt: '2026-01-20T09:00:00Z',
        lastMessage: {
            id: 'msg-1',
            conversationId: 'conv-1',
            senderId: 'mng-1',
            senderName: 'John Doe',
            senderRole: 'manager',
            content: 'The site report for Grand View is ready.',
            timestamp: '2026-01-20T09:00:00Z',
            read: false
        }
    },
    {
        id: 'conv-2',
        type: 'project',
        name: 'Grand View Apartment - Field Team',
        participants: ['admin-1', 'mng-1', 'wrk-1', 'wrk-2'],
        unreadCount: 0,
        status: 'active',
        projectId: 'proj-1',
        createdAt: '2026-01-12T08:00:00Z',
        updatedAt: '2026-01-19T14:30:00Z',
        lastMessage: {
            id: 'msg-2',
            conversationId: 'conv-2',
            senderId: 'wrk-1',
            senderName: 'Mike Ross',
            senderRole: 'worker',
            content: 'Finishing the tiles on the 4th floor.',
            timestamp: '2026-01-19T14:30:00Z',
            read: true
        }
    },
    {
        id: 'conv-3',
        type: 'group',
        name: 'Regional Managers HQ',
        participants: ['admin-1', 'mng-1', 'mng-2'],
        unreadCount: 5,
        status: 'active',
        createdAt: '2026-01-05T09:00:00Z',
        updatedAt: '2026-01-20T10:15:00Z',
        lastMessage: {
            id: 'msg-3',
            conversationId: 'conv-3',
            senderId: 'admin-1',
            senderName: 'Fajar Kun',
            senderRole: 'admin',
            content: 'Meeting tomorrow at 10 AM regarding new safety protocols.',
            timestamp: '2026-01-20T10:15:00Z',
            read: false
        }
    },
    {
        id: 'conv-4',
        type: 'individual',
        name: 'Sam Smith (Worker)',
        participants: ['mng-1', 'wrk-2'],
        unreadCount: 0,
        status: 'closed',
        createdAt: '2026-01-15T11:00:00Z',
        updatedAt: '2026-01-18T16:00:00Z',
        lastMessage: {
            id: 'msg-4',
            conversationId: 'conv-4',
            senderId: 'admin-1',
            senderName: 'Fajar Kun',
            senderRole: 'admin',
            content: 'This discussion is resolved and archived.',
            timestamp: '2026-01-18T16:00:00Z',
            read: true
        }
    }
];

export const mockChatMessages: Record<string, ChatMessage[]> = {
    'conv-1': [
        {
            id: 'msg-1-1',
            conversationId: 'conv-1',
            senderId: 'admin-1',
            senderName: 'Fajar Kun',
            senderRole: 'admin',
            content: 'Hi John, how is the progress at Grand View?',
            timestamp: '2026-01-20T08:30:00Z',
            read: true
        },
        {
            id: 'msg-1',
            conversationId: 'conv-1',
            senderId: 'mng-1',
            senderName: 'John Doe',
            senderRole: 'manager',
            content: 'The site report for Grand View is ready.',
            timestamp: '2026-01-20T09:00:00Z',
            read: false
        }
    ],
    'conv-2': [
        {
            id: 'msg-2-1',
            conversationId: 'conv-2',
            senderId: 'mng-1',
            senderName: 'John Doe',
            senderRole: 'manager',
            content: '@Mike please update on the tile progress.',
            timestamp: '2026-01-19T14:00:00Z',
            read: true
        },
        {
            id: 'msg-2',
            conversationId: 'conv-2',
            senderId: 'wrk-1',
            senderName: 'Mike Ross',
            senderRole: 'worker',
            content: 'Finishing the tiles on the 4th floor.',
            timestamp: '2026-01-19T14:30:00Z',
            read: true
        }
    ]
};
