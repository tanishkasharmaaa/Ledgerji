import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  upiId?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; phone?: string; password: string; businessName?: string }) => Promise<void>;
  googleLogin: (data: { googleId: string; name: string; email: string; avatarUrl?: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,
      isInitialized: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post<{ user: User; accessToken: string }>('/auth/login', { email, password });
          set({ user: res.user, accessToken: res.accessToken, isAuthenticated: true, isInitialized: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.post<{ user: User; accessToken: string }>('/auth/register', data);
          set({ user: res.user, accessToken: res.accessToken, isAuthenticated: true, isInitialized: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      googleLogin: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.post<{ user: User; accessToken: string }>('/auth/google', data);
          set({ user: res.user, accessToken: res.accessToken, isAuthenticated: true, isInitialized: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {}
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      fetchProfile: async () => {
        try {
          const res = await api.get<{ user: User }>('/auth/me');
          set({ user: res.user, isAuthenticated: true, isInitialized: true });
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false, isInitialized: true });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false, isInitialized: true }),
    }),
    {
      name: 'ledgerji-auth',
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }),
    },
  ),
);