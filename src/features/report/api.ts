import apiClient from '@/api/client';
import type { ApiResponse } from '@/shared/types';
import type {
  DashboardStats,
  ReportItem,
  ScanLogListResponse,
  VehicleSearchResult,
} from './types';

export const searchVehicle = async (number: string) => {
  const response = await apiClient.get<ApiResponse<VehicleSearchResult>>(
    '/vehicles/search',
    {
      params: { number },
    },
  );
  return response.data.data;
};

export const fetchDashboardStats = async () => {
  const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
  return response.data.data;
};

export const fetchScanLogs = async (params: { from?: string; to?: string; page?: number; pageSize?: number }) => {
  const response = await apiClient.get<ApiResponse<ScanLogListResponse>>('/scan-logs', { params });
  return response.data.data;
};

export const fetchDailyReport = async () => {
  const response = await apiClient.get<ApiResponse<{ items: ReportItem[] }>>('/reports/daily');
  return response.data.data;
};

export const exportReport = async (type: 'csv' | 'xlsx') => {
  const response = await apiClient.get<ApiResponse<{ url: string }>>('/reports/export', {
    params: { type },
  });
  return response.data.data;
};
