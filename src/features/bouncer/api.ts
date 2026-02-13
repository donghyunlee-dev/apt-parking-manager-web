import apiClient from '@/api/client';
import type { ApiResponse } from '@/shared/types';
import type { BouncerListResponse } from './types';

export interface BouncerQueryParams {
  name?: string;
  used?: 'Y' | 'N';
  page?: number;
  pageSize?: number;
}

export const fetchBouncers = async (params: BouncerQueryParams) => {
  const response = await apiClient.get<ApiResponse<BouncerListResponse>>('/bouncers', {
    params,
  });
  return response.data.data;
};

export const createBouncer = async (payload: {
  bouncer_name: string;
  fin_no: string;
  used: 'Y' | 'N';
}) => {
  const response = await apiClient.post<ApiResponse<{ bouncer_code: string }>>(
    '/bouncers',
    payload,
  );
  return response.data.data;
};

export const updateBouncer = async (
  bouncerCode: string,
  payload: { bouncer_name: string; used: 'Y' | 'N'; fin_no?: string },
) => {
  await apiClient.put(`/bouncers/${bouncerCode}`, payload);
};

export const deleteBouncer = async (bouncerCode: string) => {
  await apiClient.delete(`/bouncers/${bouncerCode}`);
};

export const checkFinDuplicated = async (finNo: string) => {
  const response = await apiClient.get<ApiResponse<{ duplicated: boolean }>>('/bouncers/fin', {
    params: { fin_no: finNo },
  });
  return response.data.data;
};
