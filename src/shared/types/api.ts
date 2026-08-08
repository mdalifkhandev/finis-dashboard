/**
 * API Response Types
 * 
 * Standard response formats for all API calls.
 * Provides consistent structure for handling API responses.
 */

export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    statusCode?: number;
}

/**
 * API Request Types
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    [key: string]: string | number | boolean | undefined;
}

export interface ApiRequestConfig extends PaginationParams, FilterParams { }

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request State
 */
export interface RequestState<T> {
    data: T | null;
    isLoading: boolean;
    error: ApiError | null;
    isSuccess: boolean;
}

/**
 * Mutation State
 */
export interface MutationState<TData = unknown, TVariables = unknown> {
    mutate: (variables: TVariables) => Promise<TData>;
    isLoading: boolean;
    error: ApiError | null;
    isSuccess: boolean;
    data: TData | null;
    reset: () => void;
}
