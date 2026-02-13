import { HttpResponse, http } from 'msw';

const apartments = [
  { apt_code: 'A0001', apt_name: '파킹케어 레지던스' },
  { apt_code: 'A0002', apt_name: '센트럴 파킹 타워' },
  { apt_code: 'A0003', apt_name: '그린파크 아파트' },
];

const bouncers = [
  {
    apt_code: 'A0001',
    bouncer_code: 'BNC-001',
    bouncer_name: '홍길동',
    fin_no: '123456',
  },
];

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const { apt_code, fin_no } = (await request.json()) as {
      apt_code: string;
      fin_no: string;
    };

    const apartment = apartments.find((item) => item.apt_code === apt_code);
    if (!apartment) {
      return HttpResponse.json({ success: false, message: '아파트 코드 없음' }, { status: 404 });
    }

    const user = bouncers.find(
      (item) => item.apt_code === apt_code && item.fin_no === fin_no,
    );

    if (!user) {
      return HttpResponse.json({ success: false, message: '인증 실패' }, { status: 401 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        token: 'mock-token-123',
        user: {
          bouncer_code: user.bouncer_code,
          bouncer_name: user.bouncer_name,
          apt_code: user.apt_code,
        },
        apartment,
      },
    });
  }),
  http.post('/api/auth/logout', () => HttpResponse.json({ success: true })),
  http.get('/api/auth/me', () =>
    HttpResponse.json({
      success: true,
      data: {
        user: {
          bouncer_code: 'BNC-001',
          bouncer_name: '홍길동',
          apt_code: 'A0001',
        },
        apartment: apartments[0],
      },
    }),
  ),
];

export const authMockData = {
  apartments,
  bouncers,
};
