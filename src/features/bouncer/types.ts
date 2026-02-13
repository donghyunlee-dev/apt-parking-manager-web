export interface Bouncer {
  apt_code: string;
  bouncer_code: string;
  bouncer_name: string;
  fin_no: string;
  used: 'Y' | 'N';
  updated_at: string;
  created_at: string;
}

export interface BouncerListResponse {
  items: Bouncer[];
  total: number;
}
