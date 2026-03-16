'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/auth-service';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  refreshUser: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login(email, password);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al iniciar sesión',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.register(email, password, name);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al registrarse',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          const token = get().token;
          if (token) {
            await authService.logout(token);
          }
        } catch (error) {
          console.error('Error during logout:', error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      setToken: (token: string | null) => {
        set({ token });
      },

      refreshUser: async () => {
        const token = get().token;
        if (!token) return;

        set({ isLoading: true });
        
        try {
          const user = await authService.getCurrentUser(token);
          set({ user, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al actualizar usuario',
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hook de conveniencia para verificar autenticación
export const useIsAuthenticated = () => {
  return useAuthStore((state) => state.isAuthenticated);
};

// Hook de conveniencia para obtener el usuario
export const useCurrentUser = () => {
  return useAuthStore((state) => state.user);
};

// Hook de conveniencia para obtener el token
export const useAuthToken = () => {
  return useAuthStore((state) => state.token);
};

// Hook de conveniencia para verificar si está cargando
export const useAuthLoading = () => {
  return useAuthStore((state) => state.isLoading);
};

// Hook de conveniencia para obtener errores
export const useAuthError = () => {
  return useAuthStore((state) => state.error);
};
