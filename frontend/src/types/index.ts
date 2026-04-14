export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  owner_name: string;
  task_count: number;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: string;
  assignee_id?: string;
  assignee_name?: string;
  creator_id?: string;
  creator_name?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  fields?: Record<string, string>;
}

export interface ProjectStats {
  by_status: { todo: number; in_progress: number; done: number };
  by_assignee: Array<{ assignee_id: string; assignee_name: string; count: number }>;
}
