import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, ProjectPayload } from '../services/project.service';
import { Project } from '../types';

export const PROJECT_KEYS = {
  all: ['projects'] as const,
  list: (page: number, limit: number) => ['projects', 'list', page, limit] as const,
  detail: (id: string) => ['projects', id] as const,
  stats: (id: string) => ['projects', id, 'stats'] as const,
};

export const useProjects = (page = 1, limit = 20) =>
  useQuery({
    queryKey: PROJECT_KEYS.list(page, limit),
    queryFn: () => projectService.list(page, limit),
    staleTime: 30_000,
  });

export const useProject = (id: string) =>
  useQuery({
    queryKey: PROJECT_KEYS.detail(id),
    queryFn: () => projectService.getById(id),
    enabled: !!id,
    staleTime: 30_000,
  });

export const useProjectStats = (id: string) =>
  useQuery({
    queryKey: PROJECT_KEYS.stats(id),
    queryFn: () => projectService.getStats(id),
    enabled: !!id,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectPayload) => projectService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECT_KEYS.all }),
  });
};

export const useUpdateProject = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ProjectPayload>) => projectService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECT_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: PROJECT_KEYS.all });
    },
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECT_KEYS.all }),
  });
};
