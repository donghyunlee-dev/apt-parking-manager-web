import { describe, expect, it, vi } from 'vitest';
import apiClient from '@/api/client';
import { fetchMe, loginRequest, logoutRequest } from '@/features/auth/api';

type MockClient = {
  post: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
};

vi.mock('@/api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const client = apiClient as unknown as MockClient;

describe('auth api', () => {
  it('loginRequest returns session', async () => {
    client.post.mockResolvedValue({
      data: {
        data: {
          token: 't',
          user: { bouncer_code: 'B1', bouncer_name: '홍길동', apt_code: 'A0001' },
          apartment: { apt_code: 'A0001', apt_name: '테스트' },
        },
      },
    });

    const result = await loginRequest('A0001', '123456');
    expect(result.token).toBe('t');
  });

  it('logoutRequest calls api', async () => {
    client.post.mockResolvedValue({ data: {} });
    await logoutRequest();
    expect(client.post).toHaveBeenCalledWith('/auth/logout');
  });

  it('fetchMe returns session without token', async () => {
    client.get.mockResolvedValue({
      data: {
        data: {
          user: { bouncer_code: 'B1', bouncer_name: '홍길동', apt_code: 'A0001' },
          apartment: { apt_code: 'A0001', apt_name: '테스트' },
        },
      },
    });

    const result = await fetchMe();
    expect(result.user.bouncer_name).toBe('홍길동');
  });
});
