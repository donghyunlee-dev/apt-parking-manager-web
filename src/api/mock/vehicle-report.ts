import { HttpResponse, http } from 'msw';
import type { DashboardStats, ScanLog, VehicleSearchResult } from '@/features/report/types';

const createLog = (index: number): ScanLog => ({
  log_id: `LOG-${String(index + 1).padStart(4, '0')}`,
  apt_code: 'A0001',
  vehicle_number: `${30 + (index % 70)}다${1000 + index}`,
  scan_date: `2026-02-${String((index % 28) + 1).padStart(2, '0')}`,
  scan_time: `${String(index % 24).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}`,
  vehicle_type: index % 3 === 0 ? 'unregistered' : index % 2 === 0 ? 'visitor' : 'resident',
  bouncer_code: `BNC-${String((index % 5) + 1).padStart(3, '0')}`,
});

const scanLogs = Array.from({ length: 200 }, (_, idx) => createLog(idx));

const dashboardStats: DashboardStats = {
  total_resident_vehicles: 420,
  total_visitor_vehicles: 120,
  today_scan_count: 86,
  today_unregistered_count: 4,
  active_visitors: 68,
  expired_visitors: 52,
};

const reportItems = [
  { label: '월', count: 40 },
  { label: '화', count: 35 },
  { label: '수', count: 50 },
  { label: '목', count: 38 },
  { label: '금', count: 60 },
  { label: '토', count: 28 },
  { label: '일', count: 20 },
];

export const vehicleReportHandlers = [
  http.get('/api/vehicles/search', ({ request }) => {
    const url = new URL(request.url);
    const number = url.searchParams.get('number') ?? '';

    const result: VehicleSearchResult = {
      vehicle_number: number,
      vehicle_type: 'resident',
      details: {
        owner: '홍길동',
        unit: '101동 1203호',
      },
      scan_history: scanLogs.slice(0, 5),
    };

    return HttpResponse.json({ success: true, data: result });
  }),
  http.get('/api/dashboard/stats', () => HttpResponse.json({ success: true, data: dashboardStats })),
  http.get('/api/scan-logs', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    let filtered = [...scanLogs];
    if (from) filtered = filtered.filter((item) => item.scan_date >= from);
    if (to) filtered = filtered.filter((item) => item.scan_date <= to);

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return HttpResponse.json({ success: true, data: { items, total } });
  }),
  http.get('/api/reports/daily', () => HttpResponse.json({ success: true, data: { items: reportItems } })),
  http.get('/api/reports/export', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') ?? 'csv';
    return HttpResponse.json({ success: true, data: { url: `https://example.com/report.${type}` } });
  }),
];
