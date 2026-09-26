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
    isActive?: boolean | null;
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
    numFloors?: number | null;
    unitPerFloor?: number | null;
    isWholeHouse?: boolean | null;
    houseSections?: string[] | null;
    floors?: Array<{
        id: string;
        name: string;
        floorNumber?: number;
        status?: string;
        units?: Array<{ id: string; name: string; type?: string | null; status?: string }>;
        rooms?: Array<{ id: string; name: string; type?: string | null; status?: string }>;
    }>;
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
    owner?: { id?: string; fullName?: string; email?: string; phone?: string | null; tenant?: any } | null;
    tenant?: { id?: string; name?: string; status?: string; subscriptionStatus?: string | null; currentPeriodEnd?: string | null; plan?: { id?: string; name?: string } | null } | null;
    _count?: { projects?: number };
}): Company => {
    const tenantObj = company.tenant || (company.owner as any)?.tenant;
    const planName = tenantObj?.plan?.name || (tenantObj?.name ? `${tenantObj.name} Plan` : null);
    const subStatus = tenantObj?.subscriptionStatus || tenantObj?.status || null;
    const hasSubscription = Boolean(
        planName &&
        subStatus &&
        subStatus !== 'cancelled' &&
        subStatus !== 'inactive' &&
        subStatus !== 'expired'
    );

    return {
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
            phone: company.phone || company.owner?.phone || '',
        },
        address: company.address || '',
        publicLink: company.website ? {
            url: company.website,
            enabled: true,
            createdAt: company.createdAt,
        } : undefined,
        projectCount: company._count?.projects ?? 0,
        createdAt: company.createdAt,
        owner: company.owner ? {
            id: company.owner.id,
            fullName: company.owner.fullName,
            email: company.owner.email,
            phone: company.owner.phone ?? undefined,
        } : null,
        tenant: tenantObj ? {
            id: tenantObj.id,
            name: tenantObj.name,
            status: tenantObj.status,
            subscriptionStatus: tenantObj.subscriptionStatus,
            currentPeriodEnd: tenantObj.currentPeriodEnd,
            plan: tenantObj.plan,
        } : null,
        subscription: {
            planName: planName || 'No Plan',
            status: subStatus || (hasSubscription ? 'active' : 'none'),
            currentPeriodEnd: tenantObj?.currentPeriodEnd || null,
            hasSubscription,
        },
    };
};

export const mapBackendProfileToCompany = (company: CompanyProfileResponse): Company => {
    const tenantObj = (company as any).tenant || (company.owner as any)?.tenant;
    const planName = tenantObj?.plan?.name || (tenantObj?.name ? `${tenantObj.name} Plan` : null);
    const subStatus = tenantObj?.subscriptionStatus || tenantObj?.status || null;
    const hasSubscription = Boolean(
        planName &&
        subStatus &&
        subStatus !== 'cancelled' &&
        subStatus !== 'inactive' &&
        subStatus !== 'expired'
    );

    return {
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
        owner: company.owner ? {
            id: (company.owner as any).id,
            fullName: company.owner.fullName ?? undefined,
            email: company.owner.email ?? undefined,
            phone: company.owner.phone ?? undefined,
        } : null,
        tenant: tenantObj ? {
            id: tenantObj.id,
            name: tenantObj.name,
            status: tenantObj.status,
            subscriptionStatus: tenantObj.subscriptionStatus,
            currentPeriodEnd: tenantObj.currentPeriodEnd,
            plan: tenantObj.plan,
        } : null,
        subscription: {
            planName: planName || 'No Plan',
            status: subStatus || (hasSubscription ? 'active' : 'none'),
            currentPeriodEnd: tenantObj?.currentPeriodEnd || null,
            hasSubscription,
        },
    };
};

export const mapBackendCompanyProjectToView = (
    companyId: string,
    companyName: string,
    project: CompanyProjectResponse,
): Project => {
    const rawFloors = project.floors ?? [];
    const mappedFloors: Project['floors'] = rawFloors.map((floor, floorIndex) => {
        const rawRooms = floor.units ?? floor.rooms ?? [];
        return {
            id: floor.id,
            projectId: project.id,
            number: floor.floorNumber ?? floorIndex + 1,
            name: floor.name || `Floor ${floorIndex + 1}`,
            type: 'floor' as const,
            status: (floor.status as any) || 'pending',
            progress: 0,
            totalRooms: rawRooms.length,
            rooms: rawRooms.map((room, roomIndex) => ({
                id: room.id,
                floorId: floor.id,
                number: room.name || String(roomIndex + 1),
                name: room.name || `Unit ${roomIndex + 1}`,
                status: 'pending' as const,
                progress: 0,
                assignedWorkers: [],
                tasks: [],
            })),
            tasks: [],
        };
    });

    return {
        id: project.id,
        name: project.name,
        companyId,
        companyName,
        type: getProjectType(project.type),
        projectConfig: project.type === 'house' || project.isWholeHouse
            ? {
                houseType: project.isWholeHouse === false ? 'sections' : 'whole_house',
                sections: project.houseSections ?? [],
            }
            : undefined,
        description: project.name,
        status: (project.status || 'planning') as Project['status'],
        startDate: project.startDate || project.createdAt || new Date().toISOString(),
        endDate: project.endDate || undefined,
        budget: project.budget ?? 0,
        address: '',
        floors: mappedFloors,
        progress: project.progress ?? 0,
        hasBudget: Boolean(project.budget && project.budget > 0),
        createdAt: project.startDate || new Date().toISOString(),
    };
};

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
                const stored = localStorage.getItem('auth_user');
                let isSuperAdmin = false;
                try {
                    isSuperAdmin = (JSON.parse(stored || '{}') as { role?: string })?.role === 'super_admin';
                } catch {}

                const url = isSuperAdmin
                    ? API_ENDPOINTS.SUPER_ADMIN.COMPANIES.LIST
                    : API_ENDPOINTS.COMPANIES.LIST;

                return {
                    url,
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
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                const stored = localStorage.getItem('auth_user');
                let role = 'user';
                let userId = '';
                try {
                    const parsed = JSON.parse(stored || '{}');
                    role = parsed?.role || 'user';
                    userId = parsed?.id || '';
                } catch {}
                return `${endpointName}_${role}_${userId}_${JSON.stringify(queryArgs || {})}`;
            },
            transformResponse: (response: ApiEnvelope<any[]> | any[]): Company[] => {
                const companies = Array.isArray(response) ? response : (response?.data ?? []);
                return companies.map(mapBackendCompanySummaryToCompany);
            },
            providesTags: ['Companies'],
        }),

        getCompanyProfile: builder.query<CompanyProfileResponse, string>({
            query: (companyId) => {
                const stored = localStorage.getItem('auth_user');
                let isSuperAdmin = false;
                try {
                    isSuperAdmin = (JSON.parse(stored || '{}') as { role?: string })?.role === 'super_admin';
                } catch {}

                return {
                    url: isSuperAdmin
                        ? API_ENDPOINTS.SUPER_ADMIN.COMPANIES.DETAIL(companyId)
                        : API_ENDPOINTS.COMPANIES.DETAIL(companyId),
                };
            },
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                const stored = localStorage.getItem('auth_user');
                let role = 'user';
                try {
                    role = (JSON.parse(stored || '{}') as { role?: string })?.role || 'user';
                } catch {}
                return `${endpointName}_${role}_${queryArgs}`;
            },
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
                if ('success' in response && 'data' in response) {
                    return response.data;
                }
                return response as CompanyProjectResponse[];
            },
            providesTags: ['Companies'],
        }),

        getCompanyPerformance: builder.query<CompanyPerformanceResponse, string>({
            query: (companyId) => {
                const stored = localStorage.getItem('auth_user');
                let isSuperAdmin = false;
                try {
                    isSuperAdmin = (JSON.parse(stored || '{}') as { role?: string })?.role === 'super_admin';
                } catch {}

                return {
                    url: isSuperAdmin
                        ? API_ENDPOINTS.SUPER_ADMIN.COMPANIES.PERFORMANCE(companyId)
                        : API_ENDPOINTS.COMPANIES.PERFORMANCE(companyId),
                };
            },
            transformResponse: (response: ApiEnvelope<CompanyPerformanceResponse> | CompanyPerformanceResponse): CompanyPerformanceResponse => {
                if ('success' in response && 'data' in response) {
                    return response.data;
                }
                return response as CompanyPerformanceResponse;
            },
            providesTags: ['Companies'],
        }),

        getCompanyDocuments: builder.query<CompanyDocumentResponse[], string>({
            query: (companyId) => {
                const stored = localStorage.getItem('auth_user');
                let isSuperAdmin = false;
                try {
                    isSuperAdmin = (JSON.parse(stored || '{}') as { role?: string })?.role === 'super_admin';
                } catch {}

                return {
                    url: isSuperAdmin
                        ? API_ENDPOINTS.SUPER_ADMIN.COMPANIES.DOCUMENTS(companyId)
                        : API_ENDPOINTS.COMPANIES.DOCUMENTS(companyId),
                };
            },
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
                const stored = localStorage.getItem('auth_user');
                let isSuperAdmin = false;
                try {
                    isSuperAdmin = (JSON.parse(stored || '{}') as { role?: string })?.role === 'super_admin';
                } catch {}

                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: isSuperAdmin
                        ? API_ENDPOINTS.SUPER_ADMIN.COMPANIES.DOCUMENTS(companyId)
                        : API_ENDPOINTS.COMPANIES.DOCUMENTS(companyId),
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: ['Companies'],
        }),

        deleteCompanyDocument: builder.mutation<void, CompanyDocumentDeleteArgs>({
            query: ({ companyId, documentId }) => {
                const stored = localStorage.getItem('auth_user');
                let isSuperAdmin = false;
                try {
                    isSuperAdmin = (JSON.parse(stored || '{}') as { role?: string })?.role === 'super_admin';
                } catch {}

                return {
                    url: isSuperAdmin
                        ? API_ENDPOINTS.SUPER_ADMIN.COMPANIES.DOCUMENT_DELETE(companyId, documentId)
                        : API_ENDPOINTS.COMPANIES.DOCUMENT_DELETE(companyId, documentId),
                    method: 'DELETE',
                };
            },
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
                const stored = localStorage.getItem('auth_user');
                let isSuperAdmin = false;
                try {
                    isSuperAdmin = (JSON.parse(stored || '{}') as { role?: string })?.role === 'super_admin';
                } catch {}

                const url = isSuperAdmin
                    ? API_ENDPOINTS.SUPER_ADMIN.COMPANIES.CREATE
                    : API_ENDPOINTS.COMPANIES.CREATE;

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
            query: ({ id, data }) => {
                const stored = localStorage.getItem('auth_user');
                let isSuperAdmin = false;
                try {
                    isSuperAdmin = (JSON.parse(stored || '{}') as { role?: string })?.role === 'super_admin';
                } catch {}

                const url = isSuperAdmin
                    ? API_ENDPOINTS.SUPER_ADMIN.COMPANIES.UPDATE(id)
                    : API_ENDPOINTS.COMPANIES.UPDATE(id);

                return {
                    url,
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
                };
            },
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
            query: (companyId) => {
                const stored = localStorage.getItem('auth_user');
                let isSuperAdmin = false;
                try {
                    isSuperAdmin = (JSON.parse(stored || '{}') as { role?: string })?.role === 'super_admin';
                } catch {}

                return {
                    url: isSuperAdmin
                        ? API_ENDPOINTS.SUPER_ADMIN.COMPANIES.DELETE(companyId)
                        : API_ENDPOINTS.COMPANIES.DELETE(companyId),
                    method: 'DELETE',
                };
            },
            transformResponse: (): void => undefined,
            invalidatesTags: ['Companies'],
        }),

        toggleCompanyStatus: builder.mutation<{ success: boolean; message?: string }, string>({
            query: (companyId) => ({
                url: `/super-admin/companies/${companyId}/toggle-status`,
                method: 'PATCH',
            }),
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
    useToggleCompanyStatusMutation,
} = companiesApi;
