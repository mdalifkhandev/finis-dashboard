import { useMemo } from 'react';
import {
    useGetDashboardOverviewQuery,
    useGetRecentActivityQuery,
    useGetWorkforceStatusQuery,
} from '@/store/dashboardApi';
import type {
    DashboardActivityItem,
    DashboardFilter,
    DashboardOverviewViewModel,
    DashboardWorkforceItem,
} from '@/shared/types';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface DashboardDateRange {
    start: Date;
    end: Date;
}

function isUnauthorizedError(error: unknown): boolean {
    const typedError = error as FetchBaseQueryError | undefined;
    return Boolean(typedError && 'status' in typedError && typedError.status === 401);
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value);

const mapFilterToQueryArgs = (
    filter: DashboardFilter,
    customRange?: DashboardDateRange | null,
) => {
    if (filter === 'custom' && customRange) {
        return {
            filter,
            customStartDate: customRange.start.toISOString(),
            customEndDate: customRange.end.toISOString(),
        };
    }

    return {
        filter: filter === 'custom' ? 'monthly' : filter,
    };
};

const mapDashboardData = (
    overview: NonNullable<ReturnType<typeof useGetDashboardOverviewQuery>['data']>,
    recentActivity: DashboardActivityItem[],
    workforceStatus: DashboardWorkforceItem[],
): DashboardOverviewViewModel => ({
    kpis: {
        companies: String(overview.stats.activeCompanies.value),
        projects: String(overview.stats.activeProjects.value),
        workforce: String(overview.stats.totalWorkforce.value),
        payroll: formatCurrency(overview.stats.payrollCost.value),
        trends: [
            overview.stats.activeCompanies.change,
            overview.stats.activeProjects.change,
            overview.stats.totalWorkforce.change,
            overview.stats.payrollCost.change,
        ],
    },
    taskCards: [
        {
            title: 'Active Tasks',
            value: overview.taskIndicators.activeTasks.value,
            trend: overview.taskIndicators.activeTasks.change,
            color: 'text-[#1D4F6D]',
            bgGradient: 'bg-gradient-to-br from-blue-50 to-transparent',
            isCount: true,
        },
        {
            title: 'Completed Tasks',
            value: overview.taskIndicators.completed.value,
            trend: overview.taskIndicators.completed.change,
            color: 'text-emerald-600',
            bgGradient: 'bg-gradient-to-br from-emerald-50 to-transparent',
            isCount: true,
        },
    ],
    projectCompletionForecast: overview.projectCompletionForecast,
    taskIndicators: overview.taskIndicators,
    subscriptionOverview: overview.subscriptionOverview,
    recentActivity,
    workforceStatus,
});

export function useDashboardStats(
    filter: DashboardFilter,
    customRange?: DashboardDateRange | null,
) {
    const overviewQuery = useGetDashboardOverviewQuery(
        mapFilterToQueryArgs(filter, customRange),
    );
    const recentActivityQuery = useGetRecentActivityQuery({ page: 1, limit: 6 });
    const workforceStatusQuery = useGetWorkforceStatusQuery({ page: 1, limit: 6 });

    const dashboard = useMemo(() => {
        if (!overviewQuery.data) {
            return undefined;
        }

        return mapDashboardData(
            overviewQuery.data,
            recentActivityQuery.data?.data ?? [],
            workforceStatusQuery.data?.data ?? [],
        );
    }, [overviewQuery.data, recentActivityQuery.data, workforceStatusQuery.data]);

    return {
        dashboard,
        stats: dashboard,
        isLoading:
            overviewQuery.isLoading ||
            recentActivityQuery.isLoading ||
            workforceStatusQuery.isLoading,
        error: overviewQuery.error,
        partialError: recentActivityQuery.error ?? workforceStatusQuery.error,
        isUnauthorized:
            isUnauthorizedError(overviewQuery.error) ||
            isUnauthorizedError(recentActivityQuery.error) ||
            isUnauthorizedError(workforceStatusQuery.error),
        refetch: () =>
            Promise.all([
                overviewQuery.refetch(),
                recentActivityQuery.refetch(),
                workforceStatusQuery.refetch(),
            ]),
    };
}
