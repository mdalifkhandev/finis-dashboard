/**
 * useAsync Hook
 * 
 * Generic hook for handling async operations with loading, error, and data states.
 * Used as foundation for all data-fetching hooks.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ApiError } from '@/shared/types';

export interface UseAsyncState<T> {
    data: T | null;
    isLoading: boolean;
    error: ApiError | null;
    isSuccess: boolean;
    isError: boolean;
}

export interface UseAsyncOptions {
    immediate?: boolean;
    onSuccess?: (data: unknown) => void;
    onError?: (error: ApiError) => void;
}

export function useAsync<T>(
    asyncFunction: () => Promise<T>,
    options: UseAsyncOptions = {}
) {
    const { immediate = true, onSuccess, onError } = options;

    const [state, setState] = useState<UseAsyncState<T>>({
        data: null,
        isLoading: immediate,
        error: null,
        isSuccess: false,
        isError: false,
    });

    const execute = useCallback(async () => {
        setState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
            isError: false,
        }));

        try {
            const response = await asyncFunction();
            setState({
                data: response,
                isLoading: false,
                error: null,
                isSuccess: true,
                isError: false,
            });
            onSuccess?.(response);
            return response;
        } catch (err) {
            const error = err as ApiError;
            setState({
                data: null,
                isLoading: false,
                error,
                isSuccess: false,
                isError: true,
            });
            onError?.(error);
            throw error;
        }
    }, [asyncFunction, onSuccess, onError]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [immediate]); // Note: We only want this to run on mount if immediate is true

    const reset = useCallback(() => {
        setState({
            data: null,
            isLoading: false,
            error: null,
            isSuccess: false,
            isError: false,
        });
    }, []);

    return {
        ...state,
        execute,
        reset,
        refetch: execute,
    };
}
