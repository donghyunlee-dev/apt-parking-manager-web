import { beforeEach, describe, expect, it, vi } from 'vitest';
import useAuthStore from '@/features/auth/store';
import type { AuthSession } from '@/features/auth/types';

vi.mock('@/features/auth/api', () => ({
  loginRequest: vi.fn(),
  logoutRequest: vi.fn(),
  fetchMe: vi.fn(),
}));

const api = await import('@/features/auth/api');

describe('auth store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      apartment: null,
      isAuthenticated: false,
      isLoading: false,
    });
    vi.clearAllMocks();
  });

  it('logs in and updates state', async () => {
    const session: AuthSession = {
      token: 'token',
      user: { bouncer_code: 'B1', bouncer_name: '홍길동', apt_code: 'A0001' },
      apartment: { apt_code: 'A0001', apt_name: '테스트' },
    };

    (api.loginRequest as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(session);

    await useAuthStore.getState().login('테스트 아파트', '123456');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('token');
    expect(state.user?.bouncer_name).toBe('홍길동');
  });

  it('refreshSession clears state on error', async () => {
    useAuthStore.setState({ token: 'token', isAuthenticated: true } as never);
    (api.fetchMe as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

    await useAuthStore.getState().refreshSession();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
  });
});
