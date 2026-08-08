/**
 * useMutation Hook
 * 
 * Hook for handling create, update, delete operations.
 * Provides loading states and error handling for mutations.
 */

import { useState, useCallback } from 'react';
import type { ApiError, ApiResponse } from '@/shared/types';

export interface UseMutationOptions<TData, TVariables> {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: ApiError, variables: TVariables) => void;
    onSettled?: (data: TData | null, error: ApiError | null, variables: TVariables) => void;
}

export interface UseMutationResult<TData, TVariables> {
    mutate: (variables: TVariables) => Promise<TData>;
    mutateAsync: (variables: TVariables) => Promise<TData>;
    data: TData | null;
    error: ApiError | null;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    reset: () => void;
}

export function useMutation<TData = unknown, TVariables = unknown>(
    mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
    options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
    const { onSuccess, onError, onSettled } = options;

    const [data, setData] = useState<TData | null>(null);
    const [error, setError] = useState<ApiError | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setIsLoading(false);
        setIsSuccess(false);
        setIsError(false);
    }, []);

    const mutateAsync = useCallback(
        async (variables: TVariables): Promise<TData> => {
            setIsLoading(true);
            setError(null);
            setIsError(false);
            setIsSuccess(false);

            try {
                const response = await mutationFn(variables);
                setData(response.data);
                setIsSuccess(true);
                onSuccess?.(response.data, variables);
                onSettled?.(response.data, null, variables);
                return response.data;
            } catch (err) {
                const apiError = err as ApiError;
                setError(apiError);
                setIsError(true);
                onError?.(apiError, variables);
                onSettled?.(null, apiError, variables);
                throw apiError;
            } finally {
                setIsLoading(false);
            }
        },
        [mutationFn, onSuccess, onError, onSettled]
    );

    const mutate = useCallback(
        (variables: TVariables) => {
            mutateAsync(variables).catch(() => {
                // Error is already handled in mutateAsync
            });
            return mutateAsync(variables);
        },
        [mutateAsync]
    );

    return {
        mutate,
        mutateAsync,
        data,
        error,
        isLoading,
        isSuccess,
        isError,
        reset,
    };
}
