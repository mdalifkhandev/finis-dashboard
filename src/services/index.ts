/**
 * Service Layer Index
 * 
 * Central export point for all services.
 * This is where backend integration happens - simply switch USE_MOCK_API to false
 * and implement RealApiService to connect to real backend.
 * 
 * CRITICAL FOR BACKEND DEVELOPERS:
 * When your real API is ready, create src/services/api/realApi.ts
 * with the same method signatures as MockApiService, then set VITE_USE_MOCK_API=false
 */

import { config } from '@/config/env';
import { MockApiService } from './mock/mockApi';

// TODO: Import RealApiService when backend is ready
// import { RealApiService } from './api/realApi';

/**
 * API Service - Switches between mock and real API based on configuration
 * 
 * During development: Uses MockApiService
 * In production: Uses RealApiService (when implemented)
 */
export const apiService = config.useMockApi
    ? MockApiService
    : MockApiService; // Change to RealApiService when ready

/**
 * Convenience exports for specific services
 * These are used throughout the app
 */
export const projectService = apiService;
export const companyService = apiService;
export const workforceService = apiService;
export const adminService = apiService;
export const timeTrackingService = apiService;
export const payrollService = apiService;
export const expenseService = apiService;
export const chatService = apiService;
export const tenantService = apiService;

/**
 * Re-export API client for direct use if needed
 */
export { apiClient } from './api/client';
export { API_ENDPOINTS } from './api/endpoints';
