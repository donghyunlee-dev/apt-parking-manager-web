import apiClient from '@/api/client';
import type { ApiResponse } from '@/shared/types';
import type { NoticeListResponse } from './types';

export interface NoticeQueryParams {
  visible?: boolean;
  important?: boolean;
  sort?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const fetchNotices = async (params: NoticeQueryParams) => {
  const response = await apiClient.get<ApiResponse<NoticeListResponse>>('/notices', { params });
  return response.data.data;
};

export const createNotice = async (payload: {
  title: string;
  content: string;
  is_important: boolean;
  is_visible: boolean;
  start_date?: string;
  end_date?: string;
}) => {
  const response = await apiClient.post<ApiResponse<{ notice_id: string }>>('/notices', payload);
  return response.data.data;
};

export const updateNotice = async (
  noticeId: string,
  payload: {
    title: string;
    content: string;
    is_important: boolean;
    is_visible: boolean;
    start_date?: string;
    end_date?: string;
  },
) => {
  await apiClient.put(`/notices/${noticeId}`, payload);
};

export const deleteNotice = async (noticeId: string) => {
  await apiClient.delete(`/notices/${noticeId}`);
};

export const updateNoticeVisibility = async (noticeId: string, isVisible: boolean) => {
  await apiClient.patch(`/notices/${noticeId}/visibility`, { is_visible: isVisible });
};
