import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

const unwrap = <T,>(response: T | { success?: boolean; data?: T }): T => {
    if (response && typeof response === 'object' && 'data' in response) {
        return (response as { data: T }).data;
    }
    return response as T;
};

export function useTasks(projectId: string) {
    return useQuery({
        queryKey: ['tasks', projectId],
        queryFn: async () => {
            const params: Record<string, string | number> = { limit: 100 };
            if (projectId) params.projectId = projectId;
            
            const response = await apiClient.get<any>(API_ENDPOINTS.TASKS.LIST, params);
            const data = unwrap(response.data);
            const rawTasks = data?.data ? data.data : (Array.isArray(data) ? data : []);
            return rawTasks.map((t: any) => ({
                ...(t.task || t),
                project: t.project,
                floors: t.floors,
                location: t.location,
                workflow: t.workflow,
                subTaskCount: t.subTaskCount,
                completedSubTaskCount: t.completedSubTaskCount,
                assignedWorkerCount: t.assignedWorkerCount,
                taskFloors: t.floors?.map((f: any) => ({ floor: f })), // Mock structure to match UI expectations if needed
                taskUnits: t.floors?.flatMap((f: any) => f.units?.map((u: any) => ({ unit: u }))) || []
            }));
        },
        enabled: !!projectId,
    });
}

export function useCreateTask() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post<any>(API_ENDPOINTS.TASKS.CREATE, data);
            return unwrap(response.data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
            queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
            queryClient.invalidateQueries({ queryKey: ['project-analysis', variables.projectId] });
        },
    });

    return {
        createTask: mutation.mutateAsync,
        isCreating: mutation.isPending,
        error: mutation.error,
    };
}

export function useAssignTask() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ taskId, data }: { taskId: string; data: any }) => {
            const response = await apiClient.post<any>(API_ENDPOINTS.TASKS.ASSIGN(taskId), data);
            return unwrap(response.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['project'] });
            queryClient.invalidateQueries({ queryKey: ['project-analysis'] });
        },
    });

    return {
        assignTask: (taskId: string, data: any) => mutation.mutateAsync({ taskId, data }),
        isAssigning: mutation.isPending,
        error: mutation.error,
    };
}

export function useUpdateTask() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ taskId, data }: { taskId: string; data: any }) => {
            const response = await apiClient.put<any>(API_ENDPOINTS.TASKS.UPDATE(taskId), data);
            return unwrap(response.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['project'] });
            queryClient.invalidateQueries({ queryKey: ['project-analysis'] });
        },
    });

    return {
        updateTask: (taskId: string, data: any) => mutation.mutateAsync({ taskId, data }),
        isUpdating: mutation.isPending,
    };
}

export function useDeleteTask() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (taskId: string) => {
            const response = await apiClient.delete<any>(API_ENDPOINTS.TASKS.DELETE(taskId));
            return unwrap(response.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['project'] });
            queryClient.invalidateQueries({ queryKey: ['project-analysis'] });
        },
    });

    return {
        deleteTask: mutation.mutateAsync,
        isDeleting: mutation.isPending,
    };
}
