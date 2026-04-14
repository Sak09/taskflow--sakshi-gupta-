import apiClient from './apiClient';
import { User } from '../types';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; password: string; }
export interface AuthResponse { user: User; token: string; }

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<{ data: AuthResponse }>('/auth/login', payload);
    return data.data;
  },
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<{ data: AuthResponse }>('/auth/register', payload);
    return data.data;
  },
};
