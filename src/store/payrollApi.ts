import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { config } from '@/config/env';

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

export interface PayrollConfig {
  companyId: string;
  companyName: string;
  period: string;
  employeeDeductions: {
    cppEmployeeRate: number;
    eiEmployeeRate: number;
    federalTaxRate: number;
    provincialTaxRate: number;
  };
  employerContributions: {
    cppEmployerRate: number;
    eiEmployerRate: number;
    wsibRate: number;
    vacationPayRate: number;
  };
}

export interface UpdatePayrollConfigDto {
  period?: string;
  cppEmployeeRate?: number;
  cppEmployerRate?: number;
  eiEmployeeRate?: number;
  eiEmployerRate?: number;
  federalTaxRate?: number;
  provincialTaxRate?: number;
  wsibRate?: number;
  vacationPayRate?: number;
}

export interface PayrollDashboardData {
  summary: {
    totalGrossPay: number;
    totalDeductions: number;
    totalNetPay: number;
    totalEmployerCost: number;
    payrollPeriod?: string;
  };
  monthlyTrends: Array<{
    month: string;
    grossPay: number;
    deductions: number;
    netPay: number;
  }>;
  currentPeriod?: {
    period: string;
    workers: number;
    pending: number;
    status: string;
  };
  deductionRates?: {
    cppEmployee: string;
    eiEmployee: string;
    federalTax: string;
    provincialTax: string;
  };
  employerRates?: {
    cppEmployer: string;
    eiEmployer: string;
    wsib: string;
    vacationPay: string;
  };
  recentRecords?: Array<{
    payrollId: string;
    company?: { id: string; name: string };
    worker?: { id: string; fullName: string; avatarUrl?: string; department?: string };
    period: string;
    hours: number;
    grossPay: number;
    deductions: number;
    netPay: number;
    status: string;
  }>;
}

export interface PayrollReportParams {
  startDate: string;
  endDate: string;
  companyIds?: string[];
  type?: string;
}

export interface PayrollReportData {
  reportDate?: string;
  reportGeneratedAt?: string;
  startDate: string;
  endDate: string;
  companies?: string[];
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  totalEmployerCost: number;
  summary?: {
    totalWorkers: number;
    totalGrossPay: number;
    totalDeductions: number;
    totalNetPay: number;
    totalEmployerCost: number;
  };
  period?: {
    start: string | Date;
    end: string | Date;
    type: string;
  };
  workers: Array<{
    payrollId?: string;
    workerId: string;
    workerName: string;
    companies?: string[];
    role: string;
    totalHours: number;
    grossPay: number;
    netPay: number;
    status?: string;
    deductions: {
      cppEmployee: string;
      eiEmployee: string;
      federalTax: string;
      provincialTax: string;
      total: number;
    };
    employerCosts: {
      cppEmployer: string;
      eiEmployer: string;
      wsib: string;
      vacationPay: string;
      total: number;
    };
    totalEmployerCost: number;
  }>;
  records?: any[];
}

export interface PayWorkerPayrollPayload {
  workerId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  hours?: number;
  ratePerHour?: number;
  grossPay?: number;
  deductions?: number;
  netPay?: number;
  paymentMethod?: string;
  notes?: string;
  payrollId?: string;
}

export interface WorkerPayrollItem {
  id: string;
  companyId: string;
  workerId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  regularHours: number;
  overtimeHours: number;
  ratePerHour: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: 'draft' | 'approved' | 'paid';
  processedAt?: string | null;
  processedBy?: string | null;
  createdAt: string;
}

export const payrollApi = createApi({
  reducerPath: 'payrollApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${config.apiBaseUrl}/super_admin/payroll-management`, 
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['PayrollConfig', 'PayrollDashboard', 'PayrollReport', 'PayrollRecord'],
  endpoints: (builder) => ({
    getPayrollConfig: builder.query<PayrollConfig, void>({
      query: () => '/config',
      transformResponse: (response: ApiEnvelope<PayrollConfig>) => response.data || (response as unknown as PayrollConfig),
      providesTags: ['PayrollConfig'],
    }),
    updatePayrollConfig: builder.mutation<PayrollConfig, UpdatePayrollConfigDto>({
      query: (body) => ({
        url: '/config',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['PayrollConfig', 'PayrollDashboard', 'PayrollReport'],
    }),
    resetPayrollConfig: builder.mutation<{ message: string; config: PayrollConfig }, void>({
      query: () => ({
        url: '/config/reset',
        method: 'PUT',
      }),
      invalidatesTags: ['PayrollConfig', 'PayrollDashboard', 'PayrollReport'],
    }),
    getPayrollDashboard: builder.query<PayrollDashboardData, { period?: string; startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: '/dashboard',
        params,
      }),
      transformResponse: (response: ApiEnvelope<PayrollDashboardData>) => response.data || (response as unknown as PayrollDashboardData),
      providesTags: ['PayrollDashboard'],
    }),
    generatePayrollReport: builder.mutation<PayrollReportData, PayrollReportParams>({
      query: (body) => ({
        url: '/report',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => {
        if (response && response.data) return response.data;
        return response;
      },
    }),
    getWorkerPayrolls: builder.query<WorkerPayrollItem[], string>({
      query: (workerId) => `/worker/${workerId}`,
      transformResponse: (response: any) => {
        if (response && Array.isArray(response.data)) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      },
      providesTags: (_result, _error, workerId) => [{ type: 'PayrollRecord', id: workerId }],
    }),
    payWorkerPayroll: builder.mutation<{ success: boolean; message: string; payroll: WorkerPayrollItem }, PayWorkerPayrollPayload>({
      query: (body) => ({
        url: '/pay',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { workerId }) => [
        { type: 'PayrollRecord', id: workerId },
        'PayrollDashboard',
        'PayrollReport',
      ],
    }),
    markPayrollPaid: builder.mutation<{ success: boolean; message: string; payroll: WorkerPayrollItem }, { payrollId: string; workerId?: string }>({
      query: ({ payrollId }) => ({
        url: `/mark-paid/${payrollId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { workerId }) => [
        ...(workerId ? [{ type: 'PayrollRecord' as const, id: workerId }] : []),
        'PayrollDashboard',
        'PayrollReport',
      ],
    }),
  }),
});

export const {
  useGetPayrollConfigQuery,
  useUpdatePayrollConfigMutation,
  useResetPayrollConfigMutation,
  useGetPayrollDashboardQuery,
  useGeneratePayrollReportMutation,
  useGetWorkerPayrollsQuery,
  usePayWorkerPayrollMutation,
  useMarkPayrollPaidMutation,
} = payrollApi;
