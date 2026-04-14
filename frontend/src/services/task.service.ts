import apiClient from './apiClient';
import { Task, TaskStatus, TaskPriority } from '../types';

export interface TaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  due_date?: string;
}

export const taskService = {
  list: async (projectId: string, params?: { status?: string; assignee?: string; page?: number; limit?: number }) => {
    const { data } = await apiClient.get<{ data: Task[]; meta: any }>(`/projects/${projectId}/tasks`, { params });
    return data;
  },
  create: async (projectId: string, payload: TaskPayload) => {
    const { data } = await apiClient.post<{ data: Task }>(`/projects/${projectId}/tasks`, payload);
    return data.data;
  },
  update: async (taskId: string, payload: Partial<TaskPayload>) => {
    const { data } = await apiClient.patch<{ data: Task }>(`/tasks/${taskId}`, payload);
    return data.data;
  },
  delete: async (taskId: string) => {
    await apiClient.delete(`/tasks/${taskId}`);
  },
};
