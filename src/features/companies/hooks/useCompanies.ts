import {
    useGetCompaniesQuery,
    useGetCompanyProfileQuery,
    useGetCompanyStatsQuery,
    useGetCompanyPerformanceQuery,
    useGetCompanyDocumentsQuery,
    useCreateCompanyMutation,
    useUpdateCompanyMutation,
    useDeleteCompanyMutation,
} from '@/store/companiesApi';
import { useGetProjectsByCompanyQuery } from '@/store/projectApi';
import { mapBackendProfileToCompany, type CompanyProfileResponse } from '@/store/companiesApi';

interface CompanyDateRange {
    start: Date;
    end: Date;
}

const normalizePeriod = (period: string) => {
    if (period === 'daily') return 'today';
    if (period === 'today' || period === 'weekly' || period === 'monthly' || period === 'yearly' || period === 'custom') {
        return period;
    }
    return 'monthly';
};

export function useCompanies() {
    const query = useGetCompaniesQuery();

    return {
        companies: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

export function useCompany(id: string) {
    const query = useGetCompanyProfileQuery(id || '', {
        skip: !id,
    });

    return {
        company: query.data ? mapBackendProfileToCompany(query.data) : undefined,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

export function useCompanyProfile(id: string) {
    const query = useGetCompanyProfileQuery(id || '', {
        skip: !id,
    });

    return {
        profile: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

export function useCompanyStats(period: string, customRange?: CompanyDateRange | null) {
    const query = useGetCompanyStatsQuery({
        period: normalizePeriod(period),
        ...(period === 'custom' && customRange ? {
            startDate: customRange.start.toISOString(),
            endDate: customRange.end.toISOString(),
        } : {}),
    });

    return {
        stats: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

export function useCompanyProjects(id: string) {
    const query = useGetProjectsByCompanyQuery(id || '', {
        skip: !id,
    });

    return {
        projects: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

export function useCompanyPerformance(id: string) {
    const query = useGetCompanyPerformanceQuery(id || '', {
        skip: !id,
    });

    return {
        performance: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

export function useCompanyDocuments(id: string) {
    const query = useGetCompanyDocumentsQuery(id || '', {
        skip: !id,
    });

    return {
        documents: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

export function useCreateCompany() {
    const [createCompany, mutation] = useCreateCompanyMutation();

    return {
        createCompany,
        isCreating: mutation.isLoading,
        error: mutation.error,
    };
}

export function useUpdateCompany() {
    const [updateCompany, mutation] = useUpdateCompanyMutation();

    return {
        updateCompany,
        isUpdating: mutation.isLoading,
        error: mutation.error,
    };
}

export function useDeleteCompany() {
    const [deleteCompany, mutation] = useDeleteCompanyMutation();

    return {
        deleteCompany,
        isDeleting: mutation.isLoading,
        error: mutation.error,
    };
}

export type { CompanyProfileResponse };
