import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MockApiService } from '../services/mock/mockApi';
import { Project } from '../lib/types';

interface UseProjectsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    timeRange?: string;
    dateRange?: { start: Date; end: Date } | null;
}

export function useProjects(params: UseProjectsParams = {}) {
    return useQuery({
        queryKey: ['projects', params],
        queryFn: () => MockApiService.getProjects(params),
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
    });
}

export function useProject(id: string) {
    return useQuery({
        queryKey: ['project', id],
        queryFn: () => MockApiService.getProject(id),
        enabled: !!id,
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<Project>) => MockApiService.createProject(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
            MockApiService.updateProject(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
        },
    });
}

export function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => MockApiService.deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}
