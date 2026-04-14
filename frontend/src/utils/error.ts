import { AxiosError } from 'axios';
import { ApiError } from '../types';

export const getApiError = (err: unknown): string => {
  const axiosErr = err as AxiosError<ApiError>;
  return axiosErr.response?.data?.error || 'Something went wrong. Please try again.';
};

export const getFieldErrors = (err: unknown): Record<string, string> => {
  const axiosErr = err as AxiosError<ApiError>;
  return axiosErr.response?.data?.fields || {};
};
