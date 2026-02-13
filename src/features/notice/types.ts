export interface Notice {
  notice_id: string;
  apt_code: string;
  title: string;
  content: string;
  is_important: boolean;
  is_visible: boolean;
  start_date?: string;
  end_date?: string;
  view_count: number;
  created_by: string;
  updated_at: string;
  created_at: string;
}

export interface NoticeListResponse {
  items: Notice[];
  total: number;
}
