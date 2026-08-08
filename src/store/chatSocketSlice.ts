import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message, Thread } from './messageApi';

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────

interface ChatSocketState {
    connected: boolean;
    onlineUserIds: string[];
    typingUsers: Record<string, string[]>;         // threadId → userId[]
    realtimeMessages: Record<string, Message[]>;   // threadId → Message[]
    threadUpdates: Record<string, { lastMessage: Message; unreadCount: number }>;
    // Super admin এর জন্য — socket থেকে নতুন support thread এলে এখানে জমা হবে
    newSupportThreads: Thread[];
}

const initialState: ChatSocketState = {
    connected: false,
    onlineUserIds: [],
    typingUsers: {},
    realtimeMessages: {},
    threadUpdates: {},
    newSupportThreads: [],
};

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const chatSocketSlice = createSlice({
    name: 'chatSocket',
    initialState,
    reducers: {

        setConnected(state, action: PayloadAction<boolean>) {
            state.connected = action.payload;
        },

        userOnline(state, action: PayloadAction<string>) {
            if (!state.onlineUserIds.includes(action.payload)) {
                state.onlineUserIds.push(action.payload);
            }
        },

        userOffline(state, action: PayloadAction<string>) {
            state.onlineUserIds = state.onlineUserIds.filter((id) => id !== action.payload);
        },

        setTyping(
            state,
            action: PayloadAction<{ threadId: string; userId: string; isTyping: boolean }>,
        ) {
            const { threadId, userId, isTyping } = action.payload;
            const current = state.typingUsers[threadId] ?? [];
            if (isTyping) {
                state.typingUsers[threadId] = current.includes(userId)
                    ? current
                    : [...current, userId];
            } else {
                state.typingUsers[threadId] = current.filter((id) => id !== userId);
            }
        },

        /** Real-time message append করা */
        appendMessage(state, action: PayloadAction<{ threadId: string; message: Message }>) {
            const { threadId, message } = action.payload;
            const existing = state.realtimeMessages[threadId] ?? [];
            // Duplicate check
            if (!existing.find((m) => m.id === message.id)) {
                state.realtimeMessages[threadId] = [...existing, message];
            }
        },

        /** API থেকে initial messages load হলে seed করা */
        seedMessages(state, action: PayloadAction<{ threadId: string; messages: Message[] }>) {
            const { threadId, messages } = action.payload;
            state.realtimeMessages[threadId] = messages;
        },

        /** Message delete করা */
        removeMessage(state, action: PayloadAction<{ threadId: string; messageId: string }>) {
            const { threadId, messageId } = action.payload;
            if (state.realtimeMessages[threadId]) {
                state.realtimeMessages[threadId] = state.realtimeMessages[threadId].filter(
                    (m) => m.id !== messageId,
                );
            }
        },

        /** Socket থেকে thread last message update */
        updateThreadMeta(
            state,
            action: PayloadAction<{ threadId: string; lastMessage: Message }>,
        ) {
            const { threadId, lastMessage } = action.payload;
            const current = state.threadUpdates[threadId];
            state.threadUpdates[threadId] = {
                lastMessage,
                unreadCount: (current?.unreadCount ?? 0) + 1,
            };
        },

        /** Thread খুললে unread count reset */
        markThreadRead(state, action: PayloadAction<string>) {
            if (state.threadUpdates[action.payload]) {
                state.threadUpdates[action.payload].unreadCount = 0;
            }
        },

        /**
         * Super admin এর জন্য।
         * User support thread create করলে socket থেকে এই event আসে।
         * Super admin এর thread list এ নতুন thread যোগ হবে।
         */
        addNewSupportThread(
            state,
            action: PayloadAction<{ threadId: string; thread: Thread }>,
        ) {
            const { thread } = action.payload;
            const alreadyExists = state.newSupportThreads.find((t) => t.id === thread.id);
            if (!alreadyExists) {
                state.newSupportThreads.unshift(thread); // সবার আগে রাখা
            }
        },

        /** Logout এ সব clear */
        resetChatSocket() {
            return initialState;
        },
    },
});

export const {
    setConnected,
    userOnline,
    userOffline,
    setTyping,
    appendMessage,
    seedMessages,
    removeMessage,
    updateThreadMeta,
    markThreadRead,
    addNewSupportThread,
    resetChatSocket,
} = chatSocketSlice.actions;

export default chatSocketSlice.reducer;

// ─────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────

export const selectIsConnected = (state: { chatSocket: ChatSocketState }) =>
    state.chatSocket.connected;

export const selectOnlineUsers = (state: { chatSocket: ChatSocketState }) =>
    state.chatSocket.onlineUserIds;

export const selectIsUserOnline = (userId: string) => (state: { chatSocket: ChatSocketState }) =>
    state.chatSocket.onlineUserIds.includes(userId);

export const selectTypingUsers = (threadId: string) => (state: { chatSocket: ChatSocketState }) =>
    state.chatSocket.typingUsers[threadId] ?? [];

export const selectRealtimeMessages = (threadId: string) => (state: { chatSocket: ChatSocketState }) =>
    state.chatSocket.realtimeMessages[threadId] ?? [];

export const selectThreadUpdate = (threadId: string) => (state: { chatSocket: ChatSocketState }) =>
    state.chatSocket.threadUpdates[threadId];

export const selectNewSupportThreads = (state: { chatSocket: ChatSocketState }) =>
    state.chatSocket.newSupportThreads;