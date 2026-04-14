import apiClient from './apiClient';
import { Project, ProjectStats } from '../types';

export interface ProjectPayload { name: string; description?: string; }

export const projectService = {
  list: async (page = 1, limit = 20) => {
    const { data } = await apiClient.get<{ data: Project[]; meta: any }>('/projects', {
      params: { page, limit },
    });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get<{ data: Project }>(`/projects/${id}`);
    return data.data;
  },
  create: async (payload: ProjectPayload) => {
    const { data } = await apiClient.post<{ data: Project }>('/projects', payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<ProjectPayload>) => {
    const { data } = await apiClient.patch<{ data: Project }>(`/projects/${id}`, payload);
    return data.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/projects/${id}`);
  },
  getStats: async (id: string) => {
    const { data } = await apiClient.get<{ data: ProjectStats }>(`/projects/${id}/stats`);
    return data.data;
  },
};
