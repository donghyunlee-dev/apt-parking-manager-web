export interface ScanLog {
  log_id: string;
  apt_code: string;
  vehicle_number: string;
  scan_date: string;
  scan_time: string;
  vehicle_type: 'resident' | 'visitor' | 'unregistered';
  bouncer_code: string;
}

export interface VehicleSearchResult {
  vehicle_number: string;
  vehicle_type: 'resident' | 'visitor' | 'unregistered';
  details: Record<string, unknown> | null;
  scan_history: ScanLog[];
}

export interface DashboardStats {
  total_resident_vehicles: number;
  total_visitor_vehicles: number;
  today_scan_count: number;
  today_unregistered_count: number;
  active_visitors: number;
  expired_visitors: number;
}

export interface ScanLogListResponse {
  items: ScanLog[];
  total: number;
}

export interface ReportItem {
  label: string;
  count: number;
}
