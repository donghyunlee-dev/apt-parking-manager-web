import apiClient from '@/api/client';
import type { AuthSession } from './types';
import type { ApiResponse } from '@/shared/types';

export const loginRequest = async (aptCode: string, finNo: string) => {
  const response = await apiClient.post<ApiResponse<AuthSession>>('/auth/login', {
    apt_code: aptCode,
    fin_no: finNo,
  });
  return response.data.data;
};

export const logoutRequest = async () => {
  await apiClient.post('/auth/logout');
};

export const fetchMe = async () => {
  const response = await apiClient.get<ApiResponse<Omit<AuthSession, 'token'>>>('/auth/me');
  return response.data.data;
};
