import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { config } from '@/config/env';

export interface PublicContentSection {
  title: string;
  content: string;
}

export interface PublicContentPage {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  body?: Record<string, unknown> | string | null;
  sections?: PublicContentSection[] | string | null;
  isPublished: boolean;
  updatedAt: string;
}

export interface PublicContentPagePayload {
  slug: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  sections?: PublicContentSection[] | null;
  isPublished?: boolean;
}

type ApiEnvelope<T> = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: T;
};

function unwrap<T>(response: any): T {
  if (response?.success !== undefined && 'data' in response) return response.data as T;
  if (response && typeof response === 'object' && 'data' in response && !Array.isArray(response))
    return response.data as T;
  return response as T;
}

export const publicContentApi = createApi({
  reducerPath: 'publicContentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: config.apiBaseUrl,
    prepareHeaders: (headers, { getState }) => {
      const stateToken = (() => {
        try {
          const state = getState() as { auth?: { token?: string | null } } | undefined;
          return state?.auth?.token ?? null;
        } catch {
          return null;
        }
      })();
      const token = stateToken || localStorage.getItem('auth_token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['PublicContent', 'SupportRequests'],
  endpoints: (builder) => ({
    getPublicContent: builder.query<PublicContentPage[], void>({
      query: () => '/public/content',
      transformResponse: (response: ApiEnvelope<PublicContentPage[]> | PublicContentPage[]): PublicContentPage[] => {
        if (Array.isArray(response)) return response;
        return unwrap<PublicContentPage[]>(response);
      },
      providesTags: ['PublicContent'],
    }),
    getPublicContentPage: builder.query<PublicContentPage, string>({
      query: (slug) => `/public/content/${slug}`,
      transformResponse: (response: ApiEnvelope<PublicContentPage> | PublicContentPage): PublicContentPage => unwrap<PublicContentPage>(response),
      providesTags: (_r, _e, slug) => [{ type: 'PublicContent', id: slug }],
    }),
    upsertPublicContentPage: builder.mutation<PublicContentPage, PublicContentPagePayload>({
      query: (body) => ({
        url: '/super-admin/content',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<PublicContentPage> | PublicContentPage) => unwrap<PublicContentPage>(response),
      invalidatesTags: ['PublicContent'],
    }),
    updatePublicContentPage: builder.mutation<PublicContentPage, PublicContentPagePayload>({
      query: ({ slug, ...body }) => ({
        url: `/super-admin/content/${slug}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiEnvelope<PublicContentPage> | PublicContentPage) => unwrap<PublicContentPage>(response),
      invalidatesTags: ['PublicContent'],
    }),
    deletePublicContentPage: builder.mutation<{ message: string }, string>({
      query: (slug) => ({
        url: `/super-admin/content/${slug}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiEnvelope<{ message: string }> | { message: string }) => unwrap<{ message: string }>(response),
      invalidatesTags: ['PublicContent'],
    }),
  }),
});

export const {
  useGetPublicContentQuery,
  useGetPublicContentPageQuery,
  useUpsertPublicContentPageMutation,
  useUpdatePublicContentPageMutation,
  useDeletePublicContentPageMutation,
} = publicContentApi;
