import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
    id: string;
    email: string;
    phone?: string | null;
    fullName: string;
    role: string;
    avatarUrl?: string | null;
    tenantId?: string | null;
}

interface AuthState {
    token: string | null;
    user: AuthUser | null;
}

const initialState: AuthState = {
    token: localStorage.getItem('auth_token'),
    user: (() => {
        try {
            const stored = localStorage.getItem('auth_user');
            return stored ? JSON.parse(stored) as AuthUser : null;
        } catch {
            return null;
        }
    })(),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
    setAuth(
            state,
            action: PayloadAction<{ token: string; user: AuthUser }>,
        ) {
            state.token = action.payload.token;
            state.user = action.payload.user;
            localStorage.setItem('auth_token', action.payload.token);
            localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
        },
        updateAuthUser(state, action: PayloadAction<Partial<AuthUser>>) {
            if (!state.user) return;
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem('auth_user', JSON.stringify(state.user));
        },
        clearAuth(state) {
            state.token = null;
            state.user = null;
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
        },
    },
});

export const { setAuth, updateAuthUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
