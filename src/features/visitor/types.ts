export interface VisitorVehicle {
  visitor_id: string;
  apt_code: string;
  building: string;
  unit: string;
  vehicle_number: string;
  visitor_phone: string;
  visit_start_date: string;
  visit_end_date: string;
  status: 'active' | 'expired';
  visit_count: number;
  updated_at: string;
  created_at: string;
}

export interface VisitHistory {
  history_id: string;
  visitor_id: string;
  visit_date: string;
  scan_count: number;
}

export interface VisitorListResponse {
  items: VisitorVehicle[];
  total: number;
}

export interface VisitorStatistics {
  summary: {
    active: number;
    expired: number;
    total_visits: number;
  };
  byDate: { date: string; count: number }[];
}
