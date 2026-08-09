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
  };
  monthlyTrends: Array<{
    month: string;
    grossPay: number;
    deductions: number;
    netPay: number;
  }>;
}

export interface PayrollReportParams {
  startDate: string;
  endDate: string;
  companyIds?: string[];
  type?: string;
}

export interface PayrollReportData {
  reportDate: string;
  startDate: string;
  endDate: string;
  companies: string[];
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  totalEmployerCost: number;
  workers: Array<{
    workerId: string;
    workerName: string;
    companies: string[];
    role: string;
    totalHours: number;
    grossPay: number;
    netPay: number;
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
  tagTypes: ['PayrollConfig', 'PayrollDashboard', 'PayrollReport'],
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
    }),
  }),
});

export const {
  useGetPayrollConfigQuery,
  useUpdatePayrollConfigMutation,
  useGetPayrollDashboardQuery,
  useGeneratePayrollReportMutation,
} = payrollApi;
