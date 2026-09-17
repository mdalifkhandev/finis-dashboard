import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { config } from '@/config/env';
import { API_ENDPOINTS } from '@/services';
import type { CompanyProjectResponse } from '@/store/companiesApi';

interface ApiEnvelope<T> {
    success?: boolean;
    statusCode?: number;
    message?: string;
    data: T;
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ProjectTeamMember {
    memberId: string;
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    role: string;
    status: string;
    department: string | null;
    managerId?: string | null;
}

const authHeaders = (headers: Headers) => {
    const token = localStorage.getItem('auth_token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
};

export const projectApi = createApi({
    reducerPath: 'projectApi',
    baseQuery: fetchBaseQuery({ baseUrl: config.apiBaseUrl, prepareHeaders: authHeaders }),
    tagTypes: ['Projects'],
    endpoints: (builder) => ({
        getProjectsByCompany: builder.query<CompanyProjectResponse[], string>({
            query: (companyId) => {
                const stored = localStorage.getItem('auth_user');
                let isSuperAdmin = false;
                try {
                    isSuperAdmin = (JSON.parse(stored || '{}') as { role?: string })?.role === 'super_admin';
                } catch {}

                return {
                    url: isSuperAdmin
                        ? API_ENDPOINTS.SUPER_ADMIN.COMPANIES.PROJECTS(companyId)
                        : API_ENDPOINTS.COMPANIES.PROJECTS(companyId),
                };
            },
            transformResponse: (response: ApiEnvelope<CompanyProjectResponse[]> | CompanyProjectResponse[]): CompanyProjectResponse[] => {
                if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
                    return response.data;
                }
                return (response as CompanyProjectResponse[]) ?? [];
            },
            providesTags: ['Projects'],
        }),
        getAdminProjects: builder.query<any[], void>({
            query: () => ({ url: '/admin/projects' }),
            transformResponse: (response: ApiEnvelope<any[]> | any[]): any[] => {
                if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
                    return response.data;
                }
                return (response as any[]) ?? [];
            },
            providesTags: ['Projects'],
        }),
        getProjectManagers: builder.query<ProjectTeamMember[], string>({
            query: (projectId) => ({ url: `/admin/projects/${projectId}/team/managers` }),
            transformResponse: (response: ApiEnvelope<ProjectTeamMember[]> | ProjectTeamMember[]): ProjectTeamMember[] => {
                if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
                    return response.data;
                }
                return (response as ProjectTeamMember[]) ?? [];
            },
            providesTags: ['Projects'],
        }),
        getProjectWorkers: builder.query<ProjectTeamMember[], string>({
            query: (projectId) => ({ url: `/admin/projects/${projectId}/team/workers` }),
            transformResponse: (response: ApiEnvelope<ProjectTeamMember[]> | ProjectTeamMember[]): ProjectTeamMember[] => {
                if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
                    return response.data;
                }
                return (response as ProjectTeamMember[]) ?? [];
            },
            providesTags: ['Projects'],
        }),
    }),
});

export const { useGetProjectsByCompanyQuery, useGetAdminProjectsQuery, useGetProjectManagersQuery, useGetProjectWorkersQuery } = projectApi;
