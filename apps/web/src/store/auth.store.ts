import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'PUBLIC' | 'PRO' | 'PREMIUM' | 'ADMIN';
  locale: string;
  subscription?: { plan: { name: string; tier: string }; status: string };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, locale?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = await api.post<any>('/auth/login', { email, password });
          api.setTokens(data.accessToken, data.refreshToken);
          set({ user: data.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, password, name, locale = 'en') => {
        set({ isLoading: true });
        try {
          const data = await api.post<any>('/auth/register', { email, password, name, locale });
          api.setTokens(data.accessToken, data.refreshToken);
          set({ user: data.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          await api.post('/auth/logout', { refreshToken });
        } catch {}
        api.clearTokens();
        set({ user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const user = await api.get<User>('/auth/me');
          set({ user, isAuthenticated: true });
        } catch {
          api.clearTokens();
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'dlmetrix-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
