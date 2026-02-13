import { HttpResponse, http } from 'msw';
import type { Notice } from '@/features/notice/types';

const today = new Date();
const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const createNotice = (index: number): Notice => ({
  notice_id: `NTC-${String(index + 1).padStart(3, '0')}`,
  apt_code: 'A0001',
  title: `공지사항 ${index + 1}`,
  content: `<p>공지 내용 ${index + 1} 입니다.</p>`,
  is_important: index % 5 === 0,
  is_visible: index % 4 !== 0,
  start_date: formatDate(today),
  end_date: formatDate(new Date(today.getTime() + 7 * 86400000)),
  view_count: 10 + index,
  created_by: '관리자',
  updated_at: formatDate(today),
  created_at: formatDate(today),
});

let notices: Notice[] = Array.from({ length: 15 }, (_, idx) => createNotice(idx));

export const noticeHandlers = [
  http.get('/api/notices', ({ request }) => {
    const url = new URL(request.url);
    const visible = url.searchParams.get('visible');
    const important = url.searchParams.get('important');
    const search = url.searchParams.get('search');
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');

    let filtered = [...notices];
    if (visible !== null) {
      filtered = filtered.filter((item) => String(item.is_visible) === visible);
    }
    if (important !== null) {
      filtered = filtered.filter((item) => String(item.is_important) === important);
    }
    if (search) {
      filtered = filtered.filter((item) => item.title.includes(search));
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return HttpResponse.json({ success: true, data: { items, total } });
  }),
  http.post('/api/notices', async ({ request }) => {
    const payload = (await request.json()) as Omit<Notice, 'notice_id' | 'apt_code' | 'view_count' | 'created_by' | 'updated_at' | 'created_at'>;
    const notice: Notice = {
      notice_id: `NTC-${String(notices.length + 1).padStart(3, '0')}`,
      apt_code: 'A0001',
      view_count: 0,
      created_by: '관리자',
      updated_at: formatDate(today),
      created_at: formatDate(today),
      ...payload,
    };
    notices = [notice, ...notices];
    return HttpResponse.json({ success: true, data: { notice_id: notice.notice_id } }, { status: 201 });
  }),
  http.put('/api/notices/:id', async ({ params, request }) => {
    const { id } = params as { id: string };
    const payload = (await request.json()) as Partial<Notice>;
    notices = notices.map((item) =>
      item.notice_id === id
        ? { ...item, ...payload, updated_at: formatDate(today) }
        : item,
    );
    return HttpResponse.json({ success: true });
  }),
  http.delete('/api/notices/:id', ({ params }) => {
    const { id } = params as { id: string };
    notices = notices.filter((item) => item.notice_id !== id);
    return HttpResponse.json({ success: true });
  }),
  http.patch('/api/notices/:id/visibility', async ({ params, request }) => {
    const { id } = params as { id: string };
    const payload = (await request.json()) as { is_visible: boolean };
    notices = notices.map((item) =>
      item.notice_id === id
        ? { ...item, is_visible: payload.is_visible, updated_at: formatDate(today) }
        : item,
    );
    return HttpResponse.json({ success: true });
  }),
];

export const noticeMockData = { notices };
