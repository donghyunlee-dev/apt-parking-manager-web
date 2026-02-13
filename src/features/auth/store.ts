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
        set({ isLoading: true });
        try {
          const session = await loginRequest(aptName, finNo);
          set({
            token: session.token,
            user: session.user,
            apartment: session.apartment,
            isAuthenticated: true,
          });
        } catch (error) {
          if (isDevelopment) {
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
          } else {
            throw error;
          }
        } finally {
          set({ isLoading: false });
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
