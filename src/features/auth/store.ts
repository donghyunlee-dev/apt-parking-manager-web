import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Apartment, AuthUser } from './types';
import { fetchMe, loginRequest, logoutRequest } from './api';
import { buildMockSession } from './mock';
import useUiStore from '@/shared/store/uiStore';
import { isDevelopment } from '@/shared/utils/env';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  apartment: Apartment | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (aptName: string, finNo: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      apartment: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (aptName, finNo) => {
        console.log('[v0] Login attempt:', { aptName, finNo });
        set({ isLoading: true });
        try {
          console.log('[v0] Calling loginRequest API...');
          const session = await loginRequest(aptName, finNo);
          console.log('[v0] Login API success:', session);
          set({
            token: session.token,
            user: session.user,
            apartment: session.apartment,
            isAuthenticated: true,
          });
        } catch (error) {
          console.log('[v0] Login API failed, checking isDevelopment:', isDevelopment);
          if (isDevelopment) {
            console.log('[v0] Using mock session');
            const session = buildMockSession(aptName);
            set({
              token: session.token,
              user: session.user,
              apartment: session.apartment,
              isAuthenticated: true,
            });
            useUiStore.getState().pushToast({
              type: 'info',
              message: 'API unavailable. Using mock session for preview.',
            });
            console.log('[v0] Mock session set, isAuthenticated should be true');
          } else {
            throw error;
          }
        } finally {
          set({ isLoading: false });
          console.log('[v0] Login complete, final state:', get());
        }
      },
      logout: async () => {
        set({ isLoading: true });
        try {
          await logoutRequest();
        } finally {
          set({
            token: null,
            user: null,
            apartment: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
      refreshSession: async () => {
        const { token } = get();
        if (!token) return;
        set({ isLoading: true });
        try {
          const session = await fetchMe();
          set({
            user: session.user,
            apartment: session.apartment,
            isAuthenticated: true,
          });
        } catch {
          set({
            token: null,
            user: null,
            apartment: null,
            isAuthenticated: false,
          });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'parkingcare-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        apartment: state.apartment,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export default useAuthStore;
