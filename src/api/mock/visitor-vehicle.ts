import { addDays, format } from 'date-fns';
import { HttpResponse, http } from 'msw';
import type { VisitHistory, VisitorVehicle } from '@/features/visitor/types';

const today = new Date();
const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

const createVisitor = (index: number): VisitorVehicle => {
  const start = addDays(today, -index);
  const end = addDays(start, (index % 5) + 1);
  return {
    visitor_id: `VST-${String(index + 1).padStart(3, '0')}`,
    apt_code: 'A0001',
    building: `${(index % 5) + 1}`,
    unit: `${(index % 20) + 1}0${index % 9}`,
    vehicle_number: `${20 + (index % 70)}N${2000 + index}`,
    visitor_phone: `010-45${index % 10}-78${index % 10}`,
    visit_start_date: formatDate(start),
    visit_end_date: formatDate(end),
    status: end < today ? 'expired' : 'active',
    visit_count: (index % 4) + 1,
    updated_at: formatDate(today),
    created_at: formatDate(today),
  };
};

let visitors: VisitorVehicle[] = Array.from({ length: 30 }, (_, idx) => createVisitor(idx));

const history: VisitHistory[] = Array.from({ length: 100 }, (_, idx) => ({
  history_id: `HIS-${String(idx + 1).padStart(4, '0')}`,
  visitor_id: `VST-${String((idx % 30) + 1).padStart(3, '0')}`,
  visit_date: formatDate(addDays(today, -(idx % 15))),
  scan_count: (idx % 3) + 1,
}));

export const visitorVehicleHandlers = [
  http.get('/api/visitor-vehicles', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as 'active' | 'expired' | null;
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const searchTerms = ['vehicle_number', 'building', 'unit', 'phone']
      .map((key) => url.searchParams.get(key))
      .filter((value): value is string => Boolean(value));
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');

    let filtered = [...visitors];
    if (status) {
      filtered = filtered.filter((item) => item.status === status);
    }

    if (searchTerms.length > 0) {
      filtered = filtered.filter((item) =>
        searchTerms.some((term) =>
          [item.vehicle_number, item.building, item.unit, item.visitor_phone]
            .join(' ')
            .includes(term),
        ),
      );
    }

    if (startDate) {
      filtered = filtered.filter((item) => item.visit_end_date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((item) => item.visit_start_date <= endDate);
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      success: true,
      data: {
        items,
        total,
      },
    });
  }),
  http.post('/api/visitor-vehicles', async ({ request }) => {
    const payload = (await request.json()) as Omit<VisitorVehicle, 'visitor_id' | 'apt_code' | 'status' | 'visit_count' | 'updated_at' | 'created_at'>;
    const endDate = new Date(payload.visit_end_date);
    const visitor: VisitorVehicle = {
      visitor_id: `VST-${String(visitors.length + 1).padStart(3, '0')}`,
      apt_code: 'A0001',
      status: endDate < new Date() ? 'expired' : 'active',
      visit_count: 1,
      updated_at: formatDate(today),
      created_at: formatDate(today),
      ...payload,
    };
    visitors = [visitor, ...visitors];
    return HttpResponse.json({ success: true, data: { visitor_id: visitor.visitor_id } }, { status: 201 });
  }),
  http.put('/api/visitor-vehicles/:id', async ({ params, request }) => {
    const { id } = params as { id: string };
    const payload = (await request.json()) as Partial<VisitorVehicle>;
    visitors = visitors.map((item) =>
      item.visitor_id === id
        ? {
            ...item,
            ...payload,
            status: new Date(payload.visit_end_date ?? item.visit_end_date) < new Date() ? 'expired' : 'active',
            updated_at: formatDate(today),
          }
        : item,
    );
    return HttpResponse.json({ success: true });
  }),
  http.delete('/api/visitor-vehicles/:id', ({ params }) => {
    const { id } = params as { id: string };
    visitors = visitors.filter((item) => item.visitor_id !== id);
    return HttpResponse.json({ success: true });
  }),
  http.get('/api/visitor-vehicles/:id/history', ({ params }) => {
    const { id } = params as { id: string };
    const items = history.filter((item) => item.visitor_id === id);
    return HttpResponse.json({ success: true, data: { items } });
  }),
  http.get('/api/visitor-vehicles/statistics', () => {
    const active = visitors.filter((item) => item.status === 'active').length;
    const expired = visitors.filter((item) => item.status === 'expired').length;
    const summary = {
      active,
      expired,
      total_visits: visitors.reduce((sum, item) => sum + item.visit_count, 0),
    };

    const byDate = Array.from({ length: 7 }, (_, idx) => ({
      date: formatDate(addDays(today, -idx)),
      count: Math.floor(Math.random() * 10) + 1,
    })).reverse();

    return HttpResponse.json({ success: true, data: { summary, byDate } });
  }),
];

export const visitorMockData = { visitors, history };
