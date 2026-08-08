import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { config } from '@/config/env';
import { setAuth, clearAuth } from './authSlice';

export interface LoginRequest {
    identifier: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        phone?: string | null;
        fullName: string;
        role: string;
        avatarUrl?: string | null;
        tenantId?: string | null;
    };
}

export interface MeResponse {
    id: string;
    email: string;
    phone?: string | null;
    fullName: string;
    role: string;
    avatarUrl?: string | null;
    tenantId?: string | null;
}

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: config.apiBaseUrl,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        me: builder.query<MeResponse, void>({
            query: () => ({
                url: '/auth/me',
                method: 'GET',
            }),
            transformResponse: (response: unknown): MeResponse => {
                if (
                    typeof response === 'object' &&
                    response !== null &&
                    'data' in response &&
                    (response as { data?: MeResponse }).data
                ) {
                    return (response as { data: MeResponse }).data;
                }

                return response as MeResponse;
            },
        }),
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (body) => ({
                url: '/auth/login',
                method: 'POST',
                body,
            }),
            transformResponse: (response: unknown): LoginResponse => {
                if (
                    typeof response === 'object' &&
                    response !== null &&
                    'data' in response &&
                    (response as { data?: LoginResponse }).data
                ) {
                    return (response as { data: LoginResponse }).data;
                }

                return response as LoginResponse;
            },
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setAuth({ token: data.accessToken, user: data.user }));
                } catch {
                    // handled by the caller
                }
            },
        }),
        logout: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                } finally {
                    dispatch(clearAuth());
                }
            },
        }),
    }),
});

export const { useMeQuery, useLoginMutation, useLogoutMutation } = authApi;
