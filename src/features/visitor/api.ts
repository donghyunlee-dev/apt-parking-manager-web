import apiClient from '@/api/client';
import type { ApiResponse } from '@/shared/types';
import type { VisitHistory, VisitorListResponse, VisitorStatistics } from './types';

export interface VisitorQueryParams {
  status?: 'active' | 'expired';
  vehicle_number?: string;
  building?: string;
  unit?: string;
  phone?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  pageSize?: number;
}

export const fetchVisitorVehicles = async (params: VisitorQueryParams) => {
  const response = await apiClient.get<ApiResponse<VisitorListResponse>>('/visitor-vehicles', {
    params,
  });
  return response.data.data;
};

export const createVisitorVehicle = async (payload: {
  building: string;
  unit: string;
  vehicle_number: string;
  visitor_phone: string;
  visit_start_date: string;
  visit_end_date: string;
}) => {
  const response = await apiClient.post<ApiResponse<{ visitor_id: string }>>(
    '/visitor-vehicles',
    payload,
  );
  return response.data.data;
};

export const updateVisitorVehicle = async (
  visitorId: string,
  payload: {
    building: string;
    unit: string;
    vehicle_number: string;
    visitor_phone: string;
    visit_start_date: string;
    visit_end_date: string;
  },
) => {
  await apiClient.put(`/visitor-vehicles/${visitorId}`, payload);
};

export const deleteVisitorVehicle = async (visitorId: string) => {
  await apiClient.delete(`/visitor-vehicles/${visitorId}`);
};

export const fetchVisitorHistory = async (visitorId: string) => {
  const response = await apiClient.get<ApiResponse<{ items: VisitHistory[] }>>(
    `/visitor-vehicles/${visitorId}/history`,
  );
  return response.data.data;
};

export const fetchVisitorStatistics = async () => {
  const response = await apiClient.get<ApiResponse<VisitorStatistics>>(
    '/visitor-vehicles/statistics',
  );
  return response.data.data;
};
