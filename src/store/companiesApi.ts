import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { config } from '@/config/env';
import { API_ENDPOINTS } from '@/services';
import type { Company, Project } from '@/shared/types';

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

export interface AdminUser {
    id: string;
    fullName: string;
    email: string;
    role: string;
    avatarUrl: string | null;
}

export interface CompanyProfileResponse {
    id: string;
    name: string;
    description?: string | null;
    industry?: string | null;
    status?: 'active' | 'inactive' | 'pending' | null;
    revenue?: number | null;
    address?: string | null;
    location?: string | null;
    website?: string | null;
    logoUrl?: string | null;
    phone?: string | null;
    email?: string | null;
    createdAt: string;
    owner?: {
        fullName?: string | null;
        email?: string | null;
        phone?: string | null;
    } | null;
    _count?: {
        projects?: number | null;
    } | null;
    publicLink?: {
        url: string;
        enabled?: boolean;
        createdAt?: string;
    } | null;
    contacts?: Array<{
        id: string;
        fullName: string;
        role?: string | null;
        email?: string | null;
        phone?: string | null;
        avatarUrl?: string | null;
        isPrimary?: boolean;
    }>;
    stats?: {
        annualRevenue: number;
        totalEmployees: string;
        projectsCompleted: number;
        safetyRating: string;
    } | null;
    directContact?: {
        phone: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
    } | null;
    performanceData?: Array<{
        project: string;
        completionPct: number;
        budgetAdherence: number;
    }>;
}

export interface CompanyDocumentResponse {
    id: string;
    name?: string;
    fileName?: string;
    fileType?: string;
    size?: string | number;
    fileSizeMb?: number | null;
    fileUrl?: string | null;
    uploadedAt?: string;
    category?: string;
    author?: string;
    uploadedByUser?: {
        id: string;
        fullName: string;
    } | null;
}

export interface CompanyProjectResponse {
    id: string;
    name: string;
    status?: string | null;
    type?: string | null;
    budget?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    progress?: number | null;
    createdAt?: string;
}

export interface CompanyPerformanceResponse {
    cards: {
        avgCompletionRate: number;
        safetyCompliance: number;
        workerEfficiency: number;
        momGrowth: string;
    };
    charts: {
        performanceTrends: {
            labels: string[];
            series: Array<{
                name: string;
                data: number[];
            }>;
        };
        projectDeliverySuccess: Array<{
            label: string;
            value: number;
        }>;
    };
}

export interface CompanyStatsResponse {
    totalCompanies: { value: number; change: string };
    activeCompanies: { value: number; change: string };
    totalRevenue: { value: number; change: string };
    avgRevenue: { value: number; change: string };
}

export interface CompanyViewDocument {
    id: string;
    name: string;
    type: string;
    size: string;
    date: string;
    category: string;
    author: string;
    url?: string | null;
}

export interface CompanyQueryArgs {
    page?: number;
    limit?: number;
    search?: string;
    period?: 'today' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    startDate?: string;
    endDate?: string;
}

interface CompanyUpdateArgs {
    id: string;
    data: Partial<Company> | FormData;
}

interface CompanyContactArgs {
    id: string;
    subject: string;
    message: string;
}

interface CompanyDocumentUploadArgs {
    companyId: string;
    file: File;
}

interface CompanyDocumentDeleteArgs {
    companyId: string;
    documentId: string;
}

const toPeriod = (period?: string): CompanyQueryArgs['period'] => {
    if (period === 'daily') return 'today';
    if (period === 'today' || period === 'weekly' || period === 'monthly' || period === 'yearly' || period === 'custom') {
        return period;
    }
    return 'monthly';
};

const formatFileSize = (size?: string | number) => {
    if (typeof size === 'string') return size;
    if (typeof size !== 'number') return '—';
    if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    if (size >= 1024) return `${Math.round(size / 1024)} KB`;
    return `${size} B`;
};

const getProjectType = (value?: string | null): 'apartment_building' | 'house' => {
    if (value?.toLowerCase().includes('house')) return 'house';
    return 'apartment_building';
};

const getCompanyStatus = (value?: string | null): Company['status'] => {
    if (value === 'inactive') return 'inactive';
    if (value === 'pending') return 'pending';
    return 'active';
};

export const mapBackendCompanySummaryToCompany = (company: {
    id: string;
    name: string;
    industry: string | null;
    revenue: number | null;
    address: string | null;
    website: string | null;
    phone: string | null;
    email: string | null;
    logoUrl: string | null;
    isActive: boolean;
    createdAt: string;
    owner?: { fullName: string; email: string } | null;
    _count?: { projects?: number };
}): Company => ({
    id: company.id,
    name: company.name,
    logo: company.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random`,
    description: company.industry || '',
    industry: company.industry || undefined,
    status: company.isActive ? 'active' : 'inactive',
    annualRevenue: company.revenue ?? undefined,
    location: company.address || undefined,
    contact: {
        name: company.owner?.fullName || company.name,
        email: company.email || company.owner?.email || '',
        phone: company.phone || '',
    },
    address: company.address || '',
    publicLink: company.website ? {
        url: company.website,
        enabled: true,
        createdAt: company.createdAt,
    } : undefined,
    projectCount: company._count?.projects ?? 0,
    createdAt: company.createdAt,
});

export const mapBackendProfileToCompany = (company: CompanyProfileResponse): Company => ({
    id: company.id,
    name: company.name,
    logo: company.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random`,
    description: company.description || company.industry || '',
    industry: company.industry || undefined,
    status: getCompanyStatus(company.status),
    annualRevenue: company.revenue ?? undefined,
    location: company.location || company.address || undefined,
    contact: {
        name: company.owner?.fullName || company.name,
        email: company.email || company.owner?.email || '',
        phone: company.phone || company.owner?.phone || '',
    },
    address: company.address || '',
    publicLink: company.publicLink
        ? {
            url: company.publicLink.url,
            enabled: company.publicLink.enabled ?? true,
            createdAt: company.publicLink.createdAt || company.createdAt,
        }
        : company.website
            ? {
                url: company.website,
                enabled: true,
                createdAt: company.createdAt,
            }
            : undefined,
    projectCount: company._count?.projects ?? 0,
    createdAt: company.createdAt,
});

export const mapBackendCompanyProjectToView = (
    companyId: string,
    companyName: string,
    project: CompanyProjectResponse,
): Project => ({
    id: project.id,
    name: project.name,
    companyId,
    companyName,
    type: getProjectType(project.type),
    projectConfig: undefined,
    description: project.name,
    status: (project.status || 'planning') as Project['status'],
    startDate: project.startDate || project.createdAt || new Date().toISOString(),
    endDate: project.endDate || undefined,
    budget: project.budget ?? 0,
    address: '',
    floors: [] as Project['floors'],
    progress: project.progress ?? 0,
    hasBudget: Boolean(project.budget && project.budget > 0),
    createdAt: project.startDate || new Date().toISOString(),
});

export const mapBackendDocumentToView = (document: CompanyDocumentResponse): CompanyViewDocument => ({
    id: document.id,
    name: document.name || document.fileName || 'Document',
    type: document.fileType || 'File',
    size: formatFileSize(
        document.fileSizeMb != null ? `${document.fileSizeMb.toFixed(2)} MB` : document.size,
    ),
    date: document.uploadedAt || new Date().toISOString().slice(0, 10),
    category: document.category || 'General',
    author: document.author || document.uploadedByUser?.fullName || 'System',
    url: document.fileUrl || undefined,
});

const authHeaders = (headers: Headers) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
};

export const companiesApi = createApi({
    reducerPath: 'companiesApi',
    baseQuery: fetchBaseQuery({
        baseUrl: config.apiBaseUrl,
        prepareHeaders: authHeaders,
    }),
    tagTypes: ['Companies'],
    endpoints: (builder) => ({
        getCompanies: builder.query<Company[], CompanyQueryArgs | void>({
            query: (queryArgs = {} as CompanyQueryArgs) => {
                const args = queryArgs as CompanyQueryArgs;
                return {
                    url: API_ENDPOINTS.SUPER_ADMIN.COMPANIES.LIST,
                    params: {
                        ...(args.page ? { page: args.page } : {}),
                        ...(args.limit ? { limit: args.limit } : {}),
                        ...(args.search ? { search: args.search } : {}),
                        ...(args.period ? { period: toPeriod(args.period) } : {}),
                        ...(args.startDate ? { startDate: args.startDate } : {}),
                        ...(args.endDate ? { endDate: args.endDate } : {}),
                    },
                };
            },
            transformResponse: (response: ApiEnvelope<Array<{
                id: string;
                name: string;
                industry: string | null;
                revenue: number | null;
                address: string | null;
                website: string | null;
                phone: string | null;
                email: string | null;
                logoUrl: string | null;
                isActive: boolean;
                createdAt: string;
                owner?: { fullName: string; email: string } | null;
                _count?: { projects?: number };
            }>> | Array<{
                id: string;
                name: string;
                industry: string | null;
                revenue: number | null;
                address: string | null;
                website: string | null;
                phone: string | null;
                email: string | null;
                logoUrl: string | null;
                isActive: boolean;
                createdAt: string;
                owner?: { fullName: string; email: string } | null;
                _count?: { projects?: number };
            }>): Company[] => {
                const companies = Array.isArray(response) ? response : response.data;
                return companies.map(mapBackendCompanySummaryToCompany);
            },
            providesTags: ['Companies'],
        }),

        getCompanyProfile: builder.query<CompanyProfileResponse, string>({
            query: (companyId) => ({
                url: API_ENDPOINTS.SUPER_ADMIN.COMPANIES.DETAIL(companyId),
            }),
            transformResponse: (response: ApiEnvelope<CompanyProfileResponse> | CompanyProfileResponse): CompanyProfileResponse => {
                if ('success' in response && 'data' in response) {
                    return response.data;
                }
                return response as CompanyProfileResponse;
            },
            providesTags: ['Companies'],
        }),

        getCompanyStats: builder.query<CompanyStatsResponse, CompanyQueryArgs | void>({
            query: (queryArgs = {} as CompanyQueryArgs) => {
                const args = queryArgs as CompanyQueryArgs;
                return {
                    url: API_ENDPOINTS.SUPER_ADMIN.COMPANIES.STATS,
                    params: {
                        period: toPeriod(args.period),
                        ...(args.startDate ? { startDate: args.startDate } : {}),
                        ...(args.endDate ? { endDate: args.endDate } : {}),
                    },
                };
            },
            transformResponse: (response: ApiEnvelope<CompanyStatsResponse> | CompanyStatsResponse): CompanyStatsResponse => {
                if ('success' in response && 'data' in response) {
                    return response.data;
                }
                return response as CompanyStatsResponse;
            },
            providesTags: ['Companies'],
        }),

        getCompanyProjects: builder.query<CompanyProjectResponse[], string>({
            query: (companyId) => ({
                url: API_ENDPOINTS.SUPER_ADMIN.COMPANIES.PROJECTS(companyId),
            }),
            transformResponse: (response: ApiEnvelope<CompanyProjectResponse[]> | CompanyProjectResponse[]): CompanyProjectResponse[] => {
                if ('success' in response && 'data' in response) {
                    return response.data;
                }
                return response as CompanyProjectResponse[];
            },
            providesTags: ['Companies'],
        }),

        getCompanyPerformance: builder.query<CompanyPerformanceResponse, string>({
            query: (companyId) => ({
                url: API_ENDPOINTS.SUPER_ADMIN.COMPANIES.PERFORMANCE(companyId),
            }),
            transformResponse: (response: ApiEnvelope<CompanyPerformanceResponse> | CompanyPerformanceResponse): CompanyPerformanceResponse => {
                if ('success' in response && 'data' in response) {
                    return response.data;
                }
                return response as CompanyPerformanceResponse;
            },
            providesTags: ['Companies'],
        }),

        getCompanyDocuments: builder.query<CompanyDocumentResponse[], string>({
            query: (companyId) => ({
                url: API_ENDPOINTS.SUPER_ADMIN.COMPANIES.DOCUMENTS(companyId),
            }),
            transformResponse: (response: ApiEnvelope<CompanyDocumentResponse[]> | CompanyDocumentResponse[]): CompanyDocumentResponse[] => {
                if ('success' in response && 'data' in response) {
                    return response.data;
                }
                return response as CompanyDocumentResponse[];
            },
            providesTags: ['Companies'],
        }),

        uploadCompanyDocument: builder.mutation<CompanyDocumentResponse, CompanyDocumentUploadArgs>({
            query: ({ companyId, file }) => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: API_ENDPOINTS.SUPER_ADMIN.COMPANIES.DOCUMENTS(companyId),
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: ['Companies'],
        }),

        deleteCompanyDocument: builder.mutation<void, CompanyDocumentDeleteArgs>({
            query: ({ companyId, documentId }) => ({
                url: API_ENDPOINTS.SUPER_ADMIN.COMPANIES.DOCUMENT_DELETE(companyId, documentId),
                method: 'DELETE',
            }),
            invalidatesTags: ['Companies'],
        }),

        getAdmins: builder.query<AdminUser[], { role?: string; projectId?: string } | void>({
            query: (params) => {
                const role = params?.role ?? 'admin';
                const projectId = params?.projectId;
                return {
                    url: projectId
                        ? `${API_ENDPOINTS.SUPER_ADMIN.USERS.LIST}?role=${encodeURIComponent(role)}&projectId=${encodeURIComponent(projectId)}`
                        : `${API_ENDPOINTS.SUPER_ADMIN.USERS.LIST}?role=${encodeURIComponent(role)}`,
                };
            },
            transformResponse: (response: ApiEnvelope<AdminUser[]> | AdminUser[]): AdminUser[] => {
                if (response && 'data' in response) return response.data;
                return response as AdminUser[];
            },
            providesTags: ['Companies'],
        }),

        createCompany: builder.mutation<Company, Partial<Company> & { ownerId?: string } | FormData>({
            query: (data) => {
                const url = API_ENDPOINTS.SUPER_ADMIN.COMPANIES.CREATE;
                if (data instanceof FormData) {
                    return { url, method: 'POST', body: data };
                }
                const payload = data as Partial<Company> & { ownerId?: string };
                return {
                    url,
                    method: 'POST',
                    body: {
                        name: payload.name,
                        ownerId: payload.ownerId,
                        industry: payload.industry,
                        description: payload.description,
                        phone: payload.contact?.phone,
                        email: payload.contact?.email,
                        website: payload.publicLink?.url,
                        address: payload.address,
                        revenue: payload.annualRevenue,
                        projectLevel: String(payload.projectCount ?? ''),
                    },
                };
            },
            transformResponse: (response: ApiEnvelope<CompanyProfileResponse> | CompanyProfileResponse): Company => {
                const company = 'success' in response && 'data' in response ? response.data : response;
                return mapBackendProfileToCompany(company as CompanyProfileResponse);
            },
            invalidatesTags: ['Companies'],
        }),

        updateCompany: builder.mutation<Company, CompanyUpdateArgs>({
            query: ({ id, data }) => ({
                url: API_ENDPOINTS.SUPER_ADMIN.COMPANIES.UPDATE(id),
                method: 'PUT',
                body: data instanceof FormData ? data : {
                    ...(data.name ? { name: data.name } : {}),
                    ...(data.industry ? { industry: data.industry } : {}),
                    ...(data.description ? { description: data.description } : {}),
                    ...(data.contact?.phone?.trim() ? { phone: data.contact.phone.trim() } : {}),
                    ...(data.contact?.email?.trim() ? { email: data.contact.email.trim() } : {}),
                    ...(data.publicLink?.url?.trim()
                        ? { website: data.publicLink.url.trim() }
                        : {}),
                    ...(data.address ? { address: data.address } : {}),
                    ...(typeof data.annualRevenue === 'number' ? { revenue: data.annualRevenue } : {}),
                    ...(data.contact?.name?.trim() ? { primaryContact: data.contact.name.trim() } : {}),
                    ...(data.contact?.email?.trim() ? { contactEmail: data.contact.email.trim() } : {}),
                    ...(data.contact?.phone?.trim() ? { contactPhone: data.contact.phone.trim() } : {}),
                },
            }),
            transformResponse: (response: ApiEnvelope<CompanyProfileResponse> | CompanyProfileResponse): Company => {
                const company = 'success' in response && 'data' in response ? response.data : response;
                return mapBackendProfileToCompany(company as CompanyProfileResponse);
            },
            invalidatesTags: ['Companies'],
        }),

        contactCompany: builder.mutation<{ success: boolean; message: string }, CompanyContactArgs>({
            query: ({ id, subject, message }) => ({
                url: API_ENDPOINTS.SUPER_ADMIN.COMPANIES.CONTACT(id),
                method: 'POST',
                body: { subject, message },
            }),
        }),

        deleteCompany: builder.mutation<void, string>({
            query: (companyId) => ({
                url: API_ENDPOINTS.SUPER_ADMIN.COMPANIES.DELETE(companyId),
                method: 'DELETE',
            }),
            transformResponse: (): void => undefined,
            invalidatesTags: ['Companies'],
        }),
    }),
});

export const {
    useGetCompaniesQuery,
    useLazyGetCompaniesQuery,
    useGetCompanyProfileQuery,
    useGetCompanyStatsQuery,
    useGetCompanyProjectsQuery,
    useLazyGetCompanyProjectsQuery,
    useGetCompanyPerformanceQuery,
    useGetCompanyDocumentsQuery,
    useUploadCompanyDocumentMutation,
    useDeleteCompanyDocumentMutation,
    useGetAdminsQuery,
    useCreateCompanyMutation,
    useUpdateCompanyMutation,
    useContactCompanyMutation,
    useDeleteCompanyMutation,
} = companiesApi;
