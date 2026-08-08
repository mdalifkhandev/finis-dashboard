import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { config } from '@/config/env';
import { API_ENDPOINTS } from '@/services';

interface ApiEnvelope<T> {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: T;
}

export interface QuoteSelectorOption {
  value: string;
  label: string;
}

export interface QuoteSelectorsResponse {
  projectTypes: QuoteSelectorOption[];
  propertyTypes: QuoteSelectorOption[];
  unitTypes: QuoteSelectorOption[];
  measurementTypes: QuoteSelectorOption[];
}

export interface QuoteMeasurementType {
  id: string;
  value: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteWorkCategory {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    workItems: number;
  };
}

export interface QuoteWorkItemCategoryRef {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}

export interface QuoteWorkItem {
  id: string;
  categoryId: string;
  projectType: string;
  propertyType: string;
  unitType: string;
  name: string;
  measurementType: string;
  unitCost?: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: QuoteWorkItemCategoryRef;
}

export interface QuoteRecord {
  id: string;
  createdById: string;
  workItemId?: string | null;
  workCategoryId?: string | null;
  projectType: string;
  propertyType: string;
  unitType: string;
  title: string;
  quantity: number;
  unit?: string | null;
  measurementType?: string | null;
  unitPrice: number;
  subtotal: number;
  notes?: string | null;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    role: string;
  };
  workItem?: {
    id: string;
    name: string;
    measurementType: string;
    unitCost?: number | null;
    projectType: string;
    propertyType: string;
    unitType: string;
    isActive: boolean;
    sortOrder: number;
  } | null;
  workCategory?: QuoteWorkItemCategoryRef | null;
}

export interface QuoteListResponse {
  total: number;
  quotes: QuoteRecord[];
  requestedBy: string;
}

export interface CreateQuotePayload {
  projectType?: string;
  propertyType?: string;
  unitType?: string;
  title?: string;
  workItemId?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  notes?: string;
  isCustom?: boolean;
}

export interface UpdateQuotePayload extends Partial<CreateQuotePayload> {
  id: string;
}

export interface CreateQuoteWorkCategoryPayload {
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateQuoteWorkCategoryPayload extends Partial<CreateQuoteWorkCategoryPayload> {}

export interface CreateQuoteWorkItemPayload {
  categoryId: string;
  projectType: string;
  propertyType: string;
  unitType: string;
  name: string;
  measurementType: string;
  unitCost?: number | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateQuoteWorkItemPayload extends Partial<CreateQuoteWorkItemPayload> {}

export interface QuoteLibraryFilters {
  search?: string;
  categoryId?: string;
  projectType?: string;
  propertyType?: string;
  unitType?: string;
  includeInactive?: boolean;
}

export interface QuoteFilters {
  search?: string;
  projectType?: string;
  propertyType?: string;
  unitType?: string;
  workCategoryId?: string;
  workItemId?: string;
  includeInactive?: boolean;
}

export interface QuoteMeasurementFilters {
  search?: string;
  includeInactive?: boolean;
}

export interface CreateQuoteMeasurementTypePayload {
  value: string;
  label: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateQuoteMeasurementTypePayload extends Partial<CreateQuoteMeasurementTypePayload> {}

const baseQuery = fetchBaseQuery({
  baseUrl: config.apiBaseUrl,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const quotesApi = createApi({
  reducerPath: 'quotesApi',
  baseQuery,
  tagTypes: ['QuoteLibrary'],
  endpoints: (builder) => ({
    getQuoteSelectors: builder.query<QuoteSelectorsResponse, void>({
      query: () => API_ENDPOINTS.QUOTES.SELECTORS,
      transformResponse: (response: ApiEnvelope<QuoteSelectorsResponse> | QuoteSelectorsResponse): QuoteSelectorsResponse => {
        if (response && typeof response === 'object' && 'data' in response) return response.data;
        return response as QuoteSelectorsResponse;
      },
      providesTags: ['QuoteLibrary'],
    }),
    getQuoteMeasurementTypes: builder.query<QuoteMeasurementType[], QuoteMeasurementFilters | void>({
      query: (params = {}) => ({
        url: API_ENDPOINTS.QUOTES.MEASUREMENT_TYPES,
        params: {
          ...(params.search ? { search: params.search } : {}),
          ...(params.includeInactive ? { includeInactive: 'true' } : {}),
        },
      }),
      transformResponse: (response: ApiEnvelope<QuoteMeasurementType[]> | QuoteMeasurementType[]): QuoteMeasurementType[] => {
        if (response && typeof response === 'object' && 'data' in response) return response.data;
        return response as QuoteMeasurementType[];
      },
      providesTags: ['QuoteLibrary'],
    }),
    createQuoteMeasurementType: builder.mutation<QuoteMeasurementType, CreateQuoteMeasurementTypePayload>({
      query: (body) => ({
        url: API_ENDPOINTS.QUOTES.MEASUREMENT_TYPES,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['QuoteLibrary'],
    }),
    updateQuoteMeasurementType: builder.mutation<QuoteMeasurementType, { id: string; data: UpdateQuoteMeasurementTypePayload }>({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.QUOTES.MEASUREMENT_TYPE(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['QuoteLibrary'],
    }),
    disableQuoteMeasurementType: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.QUOTES.MEASUREMENT_TYPE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['QuoteLibrary'],
    }),
    getQuoteWorkCategories: builder.query<QuoteWorkCategory[], QuoteLibraryFilters | void>({
      query: (params = {}) => ({
        url: API_ENDPOINTS.QUOTES.WORK_CATEGORIES,
        params: {
          ...(params.search ? { search: params.search } : {}),
          ...(params.includeInactive ? { includeInactive: 'true' } : {}),
        },
      }),
      transformResponse: (response: ApiEnvelope<QuoteWorkCategory[]> | QuoteWorkCategory[]): QuoteWorkCategory[] => {
        if (response && typeof response === 'object' && 'data' in response) return response.data;
        return response as QuoteWorkCategory[];
      },
      providesTags: ['QuoteLibrary'],
    }),
    createQuoteWorkCategory: builder.mutation<QuoteWorkCategory, CreateQuoteWorkCategoryPayload>({
      query: (body) => ({
        url: API_ENDPOINTS.QUOTES.WORK_CATEGORIES,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['QuoteLibrary'],
    }),
    updateQuoteWorkCategory: builder.mutation<QuoteWorkCategory, { id: string; data: UpdateQuoteWorkCategoryPayload }>({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.QUOTES.WORK_CATEGORY(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['QuoteLibrary'],
    }),
    disableQuoteWorkCategory: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.QUOTES.WORK_CATEGORY(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['QuoteLibrary'],
    }),
    getQuoteWorkItems: builder.query<QuoteWorkItem[], QuoteLibraryFilters | void>({
      query: (params = {}) => ({
        url: API_ENDPOINTS.QUOTES.WORK_ITEMS,
        params: {
          ...(params.search ? { search: params.search } : {}),
          ...(params.categoryId ? { categoryId: params.categoryId } : {}),
          ...(params.projectType ? { projectType: params.projectType } : {}),
          ...(params.propertyType ? { propertyType: params.propertyType } : {}),
          ...(params.unitType ? { unitType: params.unitType } : {}),
          ...(params.includeInactive ? { includeInactive: 'true' } : {}),
        },
      }),
      transformResponse: (response: ApiEnvelope<QuoteWorkItem[]> | QuoteWorkItem[]): QuoteWorkItem[] => {
        if (response && typeof response === 'object' && 'data' in response) return response.data;
        return response as QuoteWorkItem[];
      },
      providesTags: ['QuoteLibrary'],
    }),
    createQuoteWorkItem: builder.mutation<QuoteWorkItem, CreateQuoteWorkItemPayload>({
      query: (body) => ({
        url: API_ENDPOINTS.QUOTES.WORK_ITEMS,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['QuoteLibrary'],
    }),
    updateQuoteWorkItem: builder.mutation<QuoteWorkItem, { id: string; data: UpdateQuoteWorkItemPayload }>({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.QUOTES.WORK_ITEM(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['QuoteLibrary'],
    }),
    disableQuoteWorkItem: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.QUOTES.WORK_ITEM(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['QuoteLibrary'],
    }),
    getQuotes: builder.query<QuoteListResponse, QuoteFilters | void>({
      query: (params = {}) => ({
        url: API_ENDPOINTS.QUOTES.LIST,
        params: {
          ...(params.search ? { search: params.search } : {}),
          ...(params.projectType ? { projectType: params.projectType } : {}),
          ...(params.propertyType ? { propertyType: params.propertyType } : {}),
          ...(params.unitType ? { unitType: params.unitType } : {}),
          ...(params.workCategoryId ? { workCategoryId: params.workCategoryId } : {}),
          ...(params.workItemId ? { workItemId: params.workItemId } : {}),
          ...(params.includeInactive ? { includeInactive: 'true' } : {}),
        },
      }),
      transformResponse: (response: ApiEnvelope<QuoteListResponse> | QuoteListResponse): QuoteListResponse => {
        if (response && typeof response === 'object' && 'data' in response) return response.data;
        return response as QuoteListResponse;
      },
      providesTags: ['QuoteLibrary'],
    }),
    createQuote: builder.mutation<QuoteRecord, CreateQuotePayload>({
      query: (body) => ({
        url: API_ENDPOINTS.QUOTES.LIST,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['QuoteLibrary'],
    }),
    updateQuote: builder.mutation<QuoteRecord, { id: string; data: Partial<CreateQuotePayload> }>({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.QUOTES.DETAIL(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['QuoteLibrary'],
    }),
    deleteQuote: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: API_ENDPOINTS.QUOTES.DETAIL(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['QuoteLibrary'],
    }),
  }),
});

export const {
  useGetQuoteSelectorsQuery,
  useGetQuoteMeasurementTypesQuery,
  useCreateQuoteMeasurementTypeMutation,
  useUpdateQuoteMeasurementTypeMutation,
  useDisableQuoteMeasurementTypeMutation,
  useGetQuoteWorkCategoriesQuery,
  useCreateQuoteWorkCategoryMutation,
  useUpdateQuoteWorkCategoryMutation,
  useDisableQuoteWorkCategoryMutation,
  useGetQuoteWorkItemsQuery,
  useCreateQuoteWorkItemMutation,
  useUpdateQuoteWorkItemMutation,
  useDisableQuoteWorkItemMutation,
  useGetQuotesQuery,
  useCreateQuoteMutation,
  useUpdateQuoteMutation,
  useDeleteQuoteMutation,
} = quotesApi;
