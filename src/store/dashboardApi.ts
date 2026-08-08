import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { config } from '@/config/env';
import { API_ENDPOINTS } from '@/services';
import type {
    DashboardActivityItem,
    DashboardFilter,
    DashboardPaginatedResponse,
    DashboardStatsResponse,
    DashboardWorkforceItem,
    SuperAdminAttendanceResponse,
} from '@/shared/types';

interface ApiEnvelope<T> {
    success?: boolean;
    statusCode?: number;
    message?: string;
    data: T;
}

export interface DashboardQueryArgs {
    filter: DashboardFilter;
    customStartDate?: string;
    customEndDate?: string;
}

export interface PaginationQueryArgs {
    page?: number;
    limit?: number;
}

const toDashboardPeriod = (filter: DashboardFilter) => {
    return filter;
};

export const dashboardApi = createApi({
    reducerPath: 'dashboardApi',
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
    tagTypes: ['Dashboard'],
    endpoints: (builder) => ({
        getDashboardOverview: builder.query<DashboardStatsResponse, DashboardQueryArgs>({
            query: ({ filter, customStartDate, customEndDate }) => {
                const params: Record<string, string> = {
                    period: toDashboardPeriod(filter),
                };

                if (filter === 'custom' && customStartDate && customEndDate) {
                    params.startDate = customStartDate;
                    params.endDate = customEndDate;
                }

                return {
                    url: API_ENDPOINTS.SUPER_ADMIN.DASHBOARD,
                    params,
                };
            },
            transformResponse: (response: ApiEnvelope<DashboardStatsResponse> | DashboardStatsResponse): DashboardStatsResponse => {
                if ('success' in response && 'data' in response) {
                    return response.data;
                }

                return response as DashboardStatsResponse;
            },
            providesTags: ['Dashboard'],
        }),
        getRecentActivity: builder.query<DashboardPaginatedResponse<DashboardActivityItem>, PaginationQueryArgs | void>({
            query: (queryArgs = {}) => ({
                url: API_ENDPOINTS.SUPER_ADMIN.DASHBOARD_RECENT_ACTIVITY,
                params: {
                    page: (queryArgs as PaginationQueryArgs)?.page ?? 1,
                    limit: (queryArgs as PaginationQueryArgs)?.limit ?? 6,
                },
            }),
            transformResponse: (
                response: ApiEnvelope<DashboardPaginatedResponse<DashboardActivityItem>> | DashboardPaginatedResponse<DashboardActivityItem>,
            ): DashboardPaginatedResponse<DashboardActivityItem> => {
                if ('success' in response && 'data' in response) {
                    return response.data;
                }

                return response as DashboardPaginatedResponse<DashboardActivityItem>;
            },
            providesTags: ['Dashboard'],
        }),
        getWorkforceStatus: builder.query<DashboardPaginatedResponse<DashboardWorkforceItem>, PaginationQueryArgs | void>({
            query: (queryArgs = {}) => ({
                url: API_ENDPOINTS.SUPER_ADMIN.DASHBOARD_WORKFORCE_STATUS,
                params: {
                    page: (queryArgs as PaginationQueryArgs)?.page ?? 1,
                    limit: (queryArgs as PaginationQueryArgs)?.limit ?? 6,
                },
            }),
            transformResponse: (
                response: ApiEnvelope<DashboardPaginatedResponse<DashboardWorkforceItem>> | DashboardPaginatedResponse<DashboardWorkforceItem>,
            ): DashboardPaginatedResponse<DashboardWorkforceItem> => {
                if ('success' in response && 'data' in response) {
                    return response.data;
                }
                return response as DashboardPaginatedResponse<DashboardWorkforceItem>;
            },
            providesTags: ['Dashboard'],
        }),
        getAttendanceSummary: builder.query<SuperAdminAttendanceResponse, { date?: string; page?: number; limit?: number } | void>({
            query: (queryArgs = {}) => ({
                url: API_ENDPOINTS.SUPER_ADMIN.DASHBOARD_ATTENDANCE_SUMMARY,
                params: {
                    ...(queryArgs as { date?: string; page?: number; limit?: number }),
                },
            }),
            transformResponse: (
                response: ApiEnvelope<SuperAdminAttendanceResponse> | SuperAdminAttendanceResponse,
            ): SuperAdminAttendanceResponse => {
                if ('success' in response && 'data' in response) {
                    return response.data;
                }
                return response as SuperAdminAttendanceResponse;
            },
            providesTags: ['Dashboard'],
        }),
        getAttendanceRecords: builder.query<SuperAdminAttendanceResponse, { date?: string; page?: number; limit?: number } | void>({
            query: (queryArgs = {}) => ({
                url: API_ENDPOINTS.SUPER_ADMIN.DASHBOARD_ATTENDANCE_RECORDS,
                params: {
                    ...(queryArgs as { date?: string; page?: number; limit?: number }),
                },
            }),
            transformResponse: (
                response: ApiEnvelope<SuperAdminAttendanceResponse> | SuperAdminAttendanceResponse,
            ): SuperAdminAttendanceResponse => {
                if ('success' in response && 'data' in response) {
                    return response.data;
                }
                return response as SuperAdminAttendanceResponse;
            },
            providesTags: ['Dashboard'],
        }),
    }),
});

export const {
    useGetDashboardOverviewQuery,
    useGetRecentActivityQuery,
    useGetWorkforceStatusQuery,
    useGetAttendanceSummaryQuery,
    useGetAttendanceRecordsQuery,
} = dashboardApi;
