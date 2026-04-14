import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService, TaskPayload } from '../services/task.service';
import { Task, TaskStatus } from '../types';

export const TASK_KEYS = {
  all: ['tasks'] as const,
  byProject: (projectId: string, filters?: object) => ['tasks', projectId, filters] as const,
};

export const useTasks = (
  projectId: string,
  filters?: { status?: string; assignee?: string; page?: number; limit?: number }
) =>
  useQuery({
    queryKey: TASK_KEYS.byProject(projectId, filters),
    queryFn: () => taskService.list(projectId, filters),
    enabled: !!projectId,
    staleTime: 15_000,
  });

export const useCreateTask = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaskPayload) => taskService.create(projectId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASK_KEYS.byProject(projectId) }),
  });
};

export const useUpdateTask = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: Partial<TaskPayload> }) =>
      taskService.update(taskId, payload),

    // Optimistic update for status changes
    onMutate: async ({ taskId, payload }) => {
      const key = TASK_KEYS.byProject(projectId);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);

      qc.setQueryData<{ data: Task[]; meta: any }>(key, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((t) =>
            t.id === taskId ? { ...t, ...payload } : t
          ),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(TASK_KEYS.byProject(projectId), context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: TASK_KEYS.byProject(projectId) }),
  });
};

export const useDeleteTask = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => taskService.delete(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASK_KEYS.byProject(projectId) }),
  });
};
