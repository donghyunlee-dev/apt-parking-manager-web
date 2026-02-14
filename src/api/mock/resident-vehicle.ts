import { HttpResponse, http } from 'msw';
import type { ResidentVehicle } from '@/features/resident/types';

const now = () => new Date().toISOString().slice(0, 10);

const createSample = (index: number): ResidentVehicle => ({
  vehicle_id: `RSV-${String(index + 1).padStart(4, '0')}`,
  apt_code: 'A0001',
  building: `${(index % 5) + 1}`,
  unit: `${(index % 20) + 1}0${index % 9}`,
  vehicle_number: `${10 + (index % 90)}가${3000 + index}`,
  phone_number: `010-12${index % 10}-34${index % 10}`,
  image_url: '',
  updated_at: now(),
  created_at: now(),
});

let vehicles: ResidentVehicle[] = [
  {
    vehicle_id: 'RSV-TEST-001',
    apt_code: 'A0001',
    building: '101',
    unit: '1201',
    vehicle_number: '12가3456',
    phone_number: '010-1111-2222',
    image_url: '',
    updated_at: now(),
    created_at: now(),
  },
  ...Array.from({ length: 50 }, (_, idx) => createSample(idx)),
];

const applySort = (items: ResidentVehicle[], sort?: string) => {
  if (sort === 'building_asc') {
    return [...items].sort((a, b) => {
      const building = Number(a.building) - Number(b.building);
      if (building !== 0) return building;
      return Number(a.unit) - Number(b.unit);
    });
  }
  return [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
};

export const residentVehicleHandlers = [
  http.get('/api/resident-vehicles', ({ request }) => {
    const url = new URL(request.url);
    const searchTerms = ['vehicle_number', 'building', 'unit', 'phone']
      .map((key) => url.searchParams.get(key))
      .filter((value): value is string => Boolean(value));
    const sort = url.searchParams.get('sort') ?? undefined;
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');

    let filtered = [...vehicles];
    if (searchTerms.length > 0) {
      filtered = filtered.filter((item) =>
        searchTerms.some((term) =>
          [item.vehicle_number, item.building, item.unit, item.phone_number ?? '']
            .join(' ')
            .includes(term),
        ),
      );
    }

    const sorted = applySort(filtered, sort);
    const total = sorted.length;
    const start = (page - 1) * pageSize;
    const items = sorted.slice(start, start + pageSize);

    return HttpResponse.json({
      success: true,
      data: {
        items,
        total,
      },
    });
  }),
  http.post('/api/resident-vehicles', async ({ request }) => {
    const payload = (await request.json()) as Omit<
      ResidentVehicle,
      'vehicle_id' | 'apt_code' | 'updated_at' | 'created_at'
    >;
    const vehicle: ResidentVehicle = {
      vehicle_id: `RSV-${String(vehicles.length + 1).padStart(4, '0')}`,
      apt_code: 'A0001',
      updated_at: now(),
      created_at: now(),
      ...payload,
    };
    vehicles = [vehicle, ...vehicles];
    return HttpResponse.json(
      { success: true, data: { vehicle_id: vehicle.vehicle_id } },
      { status: 201 },
    );
  }),
  http.post('/api/resident-vehicles/bulk', async () => {
    const total = 20;
    const success = 18;
    const failed = 2;
    return HttpResponse.json({ success: true, data: { total, success, failed } });
  }),
  http.put('/api/resident-vehicles/:id', async ({ params, request }) => {
    const { id } = params as { id: string };
    const payload = (await request.json()) as Partial<ResidentVehicle>;
    vehicles = vehicles.map((item) =>
      item.vehicle_id === id ? { ...item, ...payload, updated_at: now() } : item,
    );
    return HttpResponse.json({ success: true });
  }),
  http.delete('/api/resident-vehicles/:id', ({ params }) => {
    const { id } = params as { id: string };
    vehicles = vehicles.filter((item) => item.vehicle_id !== id);
    return HttpResponse.json({ success: true });
  }),
  http.get('/api/resident-vehicles/template', () =>
    HttpResponse.json({ success: true, data: { url: 'https://example.com/template.xlsx' } }),
  ),
];

export const residentVehicleMockData = { vehicles };
