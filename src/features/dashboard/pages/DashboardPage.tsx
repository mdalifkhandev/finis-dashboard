import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  HardHat,
  ClipboardList,
  CheckCircle2,
  CreditCard,
  Clock3,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import {
  KPICard,
  StatCard,
  ProjectProgressChart,
  ActivityFeed,
  DashboardHeader,
  SegmentedIndicator,
  AdminDashboard,
} from '../components';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { SEO } from '@/shared/components/seo/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { Badge } from '@/shared/components/ui/Badge';
import { ROUTES } from '@/config/routes';
import type { DashboardFilter } from '@/shared/types';
import { cn } from '@/shared/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuth, selectAuthUser } from '@/store/authSlice';

function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      <Skeleton className="h-14 w-full rounded-2xl" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-gray-100 shadow-sm rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <Skeleton className="h-12 w-12 rounded-2xl" />
              </div>
              <div className="mt-6 space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="border-gray-100 shadow-sm rounded-3xl">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="col-span-2 border-gray-100 shadow-sm rounded-3xl">
          <CardContent className="p-6 space-y-5">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-[320px] w-full rounded-2xl" />
          </CardContent>
        </Card>
        <Card className="border-gray-100 shadow-sm rounded-3xl">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-[320px] w-full rounded-2xl" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-gray-100 shadow-sm rounded-3xl">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-36" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100 shadow-sm rounded-3xl">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [activeFilter, setActiveFilter] = useState<DashboardFilter>('monthly');
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | null>(null);
  const { dashboard, isLoading, error, partialError, isUnauthorized, refetch } = useDashboardStats(activeFilter, customRange);

  useEffect(() => {
    if (!isUnauthorized) return;

    dispatch(clearAuth());
    navigate(ROUTES.LOGIN, { replace: true });
  }, [dispatch, isUnauthorized, navigate]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter as DashboardFilter);
    if (filter !== 'custom') {
      setCustomRange(null);
    }
  };

  const handleCustomDateChange = (start: Date, end: Date) => {
    setActiveFilter('custom');
    setCustomRange({ start, end });
  };

  const kpis = dashboard?.kpis || {
    companies: '0', projects: '0', workforce: '0', payroll: '$0',
    trends: [0, 0, 0, 0]
  };

  const taskCards = dashboard?.taskCards || [];
  const forecast = dashboard?.projectCompletionForecast;
  const taskIndicators = dashboard?.taskIndicators;
  const activities = dashboard?.recentActivity ?? [];
  const workforceStatus = dashboard?.workforceStatus ?? [];
  const subscriptionStats = dashboard?.subscriptionOverview;
  const subscriptionCards = subscriptionStats?.cards;

  return (
    <div className="space-y-8 pb-12">
      <SEO title="Super Admin Dashboard" />
      <DashboardHeader
        onFilterChange={handleFilterChange}
        onCustomDateChange={handleCustomDateChange}
      />

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>Dashboard data could not be loaded from the backend.</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-red-200 text-red-700 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      )}

      {!error && partialError && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Some dashboard widgets could not be loaded from the backend.
        </div>
      )}

      {isLoading && !dashboard && <DashboardSkeleton />}

      {!isLoading || dashboard ? (
        <>
          {/* Top Row - KPIs */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <KPICard title="Active Companies" value={kpis.companies} trend={kpis.trends[0]} icon={Building2} color="blue" />
            <KPICard title="Active Projects" value={kpis.projects} trend={kpis.trends[1]} icon={ClipboardList} color="blue" />
            <KPICard title="Total Workforce" value={kpis.workforce} trend={kpis.trends[2]} icon={HardHat} color="green" />
            <KPICard title="Subscription Revenue" value={kpis.payroll} trend={kpis.trends[3]} icon={CreditCard} color="purple" />
          </div>

          {/* Second Row - Performance Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {taskCards.map((card) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={
                  card.title === 'Active Tasks'
                    ? ClipboardList
                    : card.title === 'Completed Tasks'
                    ? CheckCircle2
                    : ShieldCheck
                }
                trend={card.trend}
                color={card.color}
                bgGradient={card.bgGradient}
                isCurrency={card.isCurrency}
                isCount={card.isCount}
              />
            ))}
          </div>

          {/* Third Row - Charts & Indicators */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ProjectProgressChart filter={activeFilter} forecast={forecast} />
            <SegmentedIndicator activeFilter={activeFilter} taskIndicators={taskIndicators} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="rounded-3xl border-gray-100 shadow-sm lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-bold text-gray-900 tracking-tight">
                  Subscription Sales Overview
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  {subscriptionCards ? `${subscriptionCards.soldCount} sales` : 'Loading...'}
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-emerald-50 p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Total Revenue</div>
                  <div className="mt-2 text-3xl font-black text-emerald-900">${(subscriptionCards?.totalRevenue ?? 0).toLocaleString()}</div>
                </div>
                <div className="rounded-2xl bg-blue-50 p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Monthly Revenue</div>
                  <div className="mt-2 text-3xl font-black text-blue-900">${(subscriptionCards?.monthlyRevenue ?? 0).toLocaleString()}</div>
                </div>
                <div className="rounded-2xl bg-violet-50 p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Yearly Revenue</div>
                  <div className="mt-2 text-3xl font-black text-violet-900">${(subscriptionCards?.yearlyRevenue ?? 0).toLocaleString()}</div>
                </div>
                <div className="rounded-2xl bg-amber-50 p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Sold Subscriptions</div>
                  <div className="mt-2 text-3xl font-black text-amber-900">{subscriptionCards?.soldCount ?? 0}</div>
                </div>
                <div className="rounded-2xl border border-gray-100 p-5 md:col-span-2 xl:col-span-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Active subscriptions</div>
                      <div className="mt-2 text-2xl font-black text-gray-900">{subscriptionCards?.activeSubscriptions ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Expired / paused</div>
                      <div className="mt-2 text-2xl font-black text-gray-900">{subscriptionCards?.expiredPaused ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Total tenants</div>
                      <div className="mt-2 text-2xl font-black text-gray-900">{subscriptionCards?.totalTenants ?? 0}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-gray-100 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900 tracking-tight">
                  Revenue By Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {subscriptionStats?.revenueByPlan?.length ? (
                  subscriptionStats.revenueByPlan.map((info) => (
                    <div key={info.planId} className="rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-gray-900">{info.planName}</div>
                        <Badge className="bg-slate-100 text-slate-700">{info.salesCount} sales</Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                        <span>Revenue</span>
                        <span className="font-semibold text-gray-900">${info.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500">
                    No subscription sales yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-3xl border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-bold text-gray-900 tracking-tight">
                Recent Buyers
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock3 className="h-4 w-4" />
                Sorted by latest renewal
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <div className="min-w-[760px] divide-y divide-gray-100">
                {(subscriptionStats?.revenueByPlan ?? []).map((item) => (
                  <div key={item.planId} className="grid grid-cols-5 gap-4 px-6 py-4 text-sm">
                    <div>
                      <div className="font-bold text-gray-900">{item.planName}</div>
                      <div className="text-xs text-gray-500">Plan sales overview</div>
                    </div>
                    <div className="font-semibold text-gray-700">{item.salesCount}</div>
                    <div className="font-semibold text-gray-700">{item.monthlyCount}</div>
                    <div className="font-semibold text-gray-700">{item.yearlyCount}</div>
                    <div>
                      <div className="font-semibold text-gray-700">${item.revenue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Total revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>


          {/* Fourth Row - Activity Feed */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ActivityFeed activities={activities} />

        {/* Workforce Status Table (Simplified) */}
        <Card className="h-full border-gray-100 shadow-sm rounded-3xl overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-4 bg-gray-50/30">
            <CardTitle className="text-lg font-bold text-gray-900 tracking-tight">
              Workforce Status
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/workforce')}
              className="text-xs font-bold text-[#1D4F6D] hover:bg-blue-50 underline"
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-gray-50">
              {workforceStatus.map((worker, i) => <div key={worker.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/80 transition-all cursor-default group">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={cn(
                      "h-2.5 w-2.5 absolute right-0 bottom-0 rounded-full ring-2 ring-white shadow-sm",
                      worker.status === 'on_time' ? 'bg-green-500' : 'bg-blue-500'
                    )} />
                    <img src={worker.avatarUrl ?? `https://i.pravatar.cc/150?u=${i + 20}`} alt="" className="h-11 w-11 rounded-full bg-gray-100 border border-gray-100 group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-[#1D4F6D] transition-colors leading-none">
                      {worker.fullName}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 leading-none">
                      {(worker.projectName ?? 'Unassigned')} • {(worker.role ?? worker.department ?? 'Staff')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">
                      {worker.hoursWorked}
                    </p>
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-wider mt-1",
                      worker.status === 'on_time' ? 'text-green-600' : 'text-blue-600'
                    )}>{worker.status === 'on_time' ? 'On Time' : 'Overtime'}</p>
                  </div>
                </div>
              </div>)}
            </div>
          </CardContent>
        </Card>
          </div>
        </>
      ) : null}


    </div>
  );
}

export function DashboardPage() {
  const authUser = useAppSelector(selectAuthUser);
  const isSuperAdmin = authUser?.role === 'super_admin';

  if (!isSuperAdmin) {
    return <AdminDashboard key={authUser?.id ?? 'admin'} />;
  }

  return <SuperAdminDashboard key={authUser?.id ?? 'super_admin'} />;
}
