import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { config } from '@/config/env';

interface ApiEnvelope<T> {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: T;
}

export interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  status: string;
  dateOfBirth: string | null;
  address: string | null;
  bio: string | null;
  department: string | null;
  employeeId: string | null;
  joinDate: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  bio?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: config.apiBaseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['AdminProfile'],
  endpoints: (builder) => ({
    getMyProfile: builder.query<AdminProfile, void>({
      query: () => '/admin/profile',
      transformResponse: (response: ApiEnvelope<AdminProfile> | AdminProfile): AdminProfile => {
        if (typeof response === 'object' && response !== null && 'data' in response) {
          return (response as ApiEnvelope<AdminProfile>).data;
        }
        return response as AdminProfile;
      },
      providesTags: ['AdminProfile'],
    }),
    updateMyProfile: builder.mutation<AdminProfile, UpdateProfilePayload | FormData>({
      query: (body) => ({
        url: '/admin/profile',
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiEnvelope<AdminProfile> | AdminProfile): AdminProfile => {
        if (typeof response === 'object' && response !== null && 'data' in response) {
          return (response as ApiEnvelope<AdminProfile>).data;
        }
        return response as AdminProfile;
      },
      invalidatesTags: ['AdminProfile'],
    }),
    changePassword: builder.mutation<{ message: string }, ChangePasswordPayload>({
      query: (body) => ({
        url: '/admin/profile/change-password',
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiEnvelope<{ message: string }> | { message: string }) => {
        if (typeof response === 'object' && response !== null && 'data' in response) {
          return (response as ApiEnvelope<{ message: string }>).data;
        }
        return response as { message: string };
      },
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useChangePasswordMutation,
} = settingsApi;
