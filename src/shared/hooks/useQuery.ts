/**
 * useQuery Hook
 * 
 * Simplified data-fetching hook with caching and refetch capabilities.
 * Prepares the app for eventual migration to React Query or similar.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiError, ApiResponse } from '@/shared/types';

export interface UseQueryOptions {
    enabled?: boolean;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
    cacheTime?: number;
    onSuccess?: (data: unknown) => void;
    onError?: (error: ApiError) => void;
}

export interface UseQueryResult<T> {
    data: T | null;
    isLoading: boolean;
    isFetching: boolean;
    error: ApiError | null;
    isSuccess: boolean;
    isError: boolean;
    refetch: () => Promise<void>;
}

// Simple in-memory cache
const queryCache = new Map<string, { data: unknown; timestamp: number }>();

export function useQuery<T>(
    queryKey: string,
    queryFn: () => Promise<ApiResponse<T>>,
    options: UseQueryOptions = {}
): UseQueryResult<T> {
    const {
        enabled = true,
        refetchOnMount = true,
        refetchOnWindowFocus = false,
        staleTime = 5 * 60 * 1000,
        cacheTime = 10 * 60 * 1000,
        onSuccess,
        onError,
    } = options;

    const [data, setData] = useState<T | null>(() => {
        const cached = queryCache.get(queryKey);
        if (cached && Date.now() - cached.timestamp < staleTime) {
            return cached.data as T;
        }
        return null;
    });

    const [isLoading, setIsLoading] = useState(!data);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);
    const [isSuccess, setIsSuccess] = useState(!!data);
    const [isError, setIsError] = useState(false);

    const isMounted = useRef(true);
    const fetchRef = useRef<number>(0);
    const queryFnRef = useRef(queryFn);

    // Update the ref whenever queryFn changes
    useEffect(() => {
        queryFnRef.current = queryFn;
    }, [queryFn]);

    const fetchData = useCallback(async () => {
        if (!enabled) return;

        const fetchId = ++fetchRef.current;
        setIsFetching(true);
        setError(null);
        setIsError(false);

        try {
            const response = await queryFnRef.current();

            // Only update if this is the latest fetch and we are still mounted
            if (fetchId === fetchRef.current && isMounted.current) {
                setData(response.data);
                setIsSuccess(true);
                setError(null);
                setIsError(false);

                // Update cache
                queryCache.set(queryKey, {
                    data: response.data,
                    timestamp: Date.now(),
                });

                onSuccess?.(response.data);
            }
        } catch (err) {
            if (fetchId === fetchRef.current && isMounted.current) {
                const apiError = err as ApiError;
                setError(apiError);
                setIsError(true);
                setIsSuccess(false);
                onError?.(apiError);
            }
        } finally {
            if (fetchId === fetchRef.current && isMounted.current) {
                setIsLoading(false);
                setIsFetching(false);
            }
        }
    }, [enabled, queryKey, onSuccess, onError]); // fetchData is now stable relative to queryFn

    // Initial fetch and key change fetch
    useEffect(() => {
        if (enabled && (refetchOnMount || !data)) {
            fetchData();
        }
    }, [queryKey, enabled, refetchOnMount]); // fetchData is stable

    // Window focus refetch
    useEffect(() => {
        if (!refetchOnWindowFocus || !enabled) return;

        const handleFocus = () => {
            const cached = queryCache.get(queryKey);
            if (!cached || Date.now() - cached.timestamp > staleTime) {
                fetchData();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [refetchOnWindowFocus, enabled, queryKey, staleTime, fetchData]);

    // Mount/Unmount tracking
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Cache cleanup
    useEffect(() => {
        const cleanup = setInterval(() => {
            const now = Date.now();
            for (const [key, value] of queryCache.entries()) {
                if (now - value.timestamp > cacheTime) {
                    queryCache.delete(key);
                }
            }
        }, 60000);

        return () => clearInterval(cleanup);
    }, [cacheTime]);

    return {
        data,
        isLoading,
        isFetching,
        error,
        isSuccess,
        isError,
        refetch: fetchData,
    };
}
