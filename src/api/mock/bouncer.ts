import { HttpResponse, http } from 'msw';
import type { Bouncer } from '@/features/bouncer/types';

const now = () => new Date().toISOString().slice(0, 10);

const createSample = (index: number): Bouncer => ({
  apt_code: 'A0001',
  bouncer_code: `BNC-${String(index + 1).padStart(3, '0')}`,
  bouncer_name: `경비원 ${index + 1}`,
  fin_no: `${100000 + index}`,
  used: index % 3 === 0 ? 'N' : 'Y',
  updated_at: now(),
  created_at: now(),
});

let bouncers: Bouncer[] = Array.from({ length: 10 }, (_, idx) => createSample(idx));

export const bouncerHandlers = [
  http.get('/api/bouncers', ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    const used = url.searchParams.get('used') as 'Y' | 'N' | null;
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');

    let filtered = [...bouncers];
    if (name) {
      filtered = filtered.filter((item) => item.bouncer_name.includes(name));
    }
    if (used) {
      filtered = filtered.filter((item) => item.used === used);
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
  http.get('/api/bouncers/fin', ({ request }) => {
    const url = new URL(request.url);
    const finNo = url.searchParams.get('fin_no');
    const duplicated = !!bouncers.find((item) => item.fin_no === finNo);
    return HttpResponse.json({ success: true, data: { duplicated } });
  }),
  http.post('/api/bouncers', async ({ request }) => {
    const payload = (await request.json()) as {
      bouncer_name: string;
      fin_no: string;
      used: 'Y' | 'N';
    };

    const bouncer: Bouncer = {
      apt_code: 'A0001',
      bouncer_code: `BNC-${String(bouncers.length + 1).padStart(3, '0')}`,
      bouncer_name: payload.bouncer_name,
      fin_no: payload.fin_no,
      used: payload.used,
      updated_at: now(),
      created_at: now(),
    };

    bouncers = [bouncer, ...bouncers];

    return HttpResponse.json({ success: true, data: { bouncer_code: bouncer.bouncer_code } }, { status: 201 });
  }),
  http.put('/api/bouncers/:code', async ({ params, request }) => {
    const { code } = params as { code: string };
    const payload = (await request.json()) as {
      bouncer_name: string;
      fin_no?: string;
      used: 'Y' | 'N';
    };

    bouncers = bouncers.map((item) =>
      item.bouncer_code === code
        ? {
            ...item,
            bouncer_name: payload.bouncer_name,
            fin_no: payload.fin_no ?? item.fin_no,
            used: payload.used,
            updated_at: now(),
          }
        : item,
    );

    return HttpResponse.json({ success: true });
  }),
  http.delete('/api/bouncers/:code', ({ params }) => {
    const { code } = params as { code: string };
    bouncers = bouncers.filter((item) => item.bouncer_code !== code);
    return HttpResponse.json({ success: true });
  }),
];

export const bouncerMockData = { bouncers };
