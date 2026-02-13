import apiClient from '@/api/client';
import type { ApiResponse } from '@/shared/types';
import type { BulkUploadResult, ResidentVehicleListResponse } from './types';

export interface ResidentQueryParams {
  vehicle_number?: string;
  building?: string;
  unit?: string;
  phone?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export const fetchResidentVehicles = async (params: ResidentQueryParams) => {
  const response = await apiClient.get<ApiResponse<ResidentVehicleListResponse>>(
    '/resident-vehicles',
    {
      params,
    },
  );
  return response.data.data;
};

export const createResidentVehicle = async (payload: {
  building: string;
  unit: string;
  vehicle_number: string;
  phone_number?: string;
  image_url?: string;
}) => {
  const response = await apiClient.post<ApiResponse<{ vehicle_id: string }>>(
    '/resident-vehicles',
    payload,
  );
  return response.data.data;
};

export const updateResidentVehicle = async (
  vehicleId: string,
  payload: {
    building: string;
    unit: string;
    vehicle_number: string;
    phone_number?: string;
    image_url?: string;
  },
) => {
  await apiClient.put(`/resident-vehicles/${vehicleId}`, payload);
};

export const deleteResidentVehicle = async (vehicleId: string) => {
  await apiClient.delete(`/resident-vehicles/${vehicleId}`);
};

export const bulkUploadResidentVehicles = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<ApiResponse<BulkUploadResult>>(
    '/resident-vehicles/bulk',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return response.data.data;
};

export const downloadResidentTemplate = async () => {
  const response = await apiClient.get<ApiResponse<{ url: string }>>(
    '/resident-vehicles/template',
  );
  return response.data.data;
};
