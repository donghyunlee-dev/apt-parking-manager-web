export interface ResidentVehicle {
  vehicle_id: string;
  apt_code: string;
  building: string;
  unit: string;
  vehicle_number: string;
  phone_number?: string;
  image_url?: string;
  updated_at: string;
  created_at: string;
}

export interface ResidentVehicleListResponse {
  items: ResidentVehicle[];
  total: number;
}

export interface BulkUploadResult {
  total: number;
  success: number;
  failed: number;
}
