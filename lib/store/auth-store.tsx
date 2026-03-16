'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/lib/services/auth-service';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
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

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setToken: (token: string | null) => {
        set({ token });
      },

      clearError: () => {
        set({ error: null });
      },

      refreshUser: async () => {
        const { token, user } = get();
        
        if (!token || !user) return;
        
        set({ isLoading: true });
        
        try {
          const updatedUser = await authService.getCurrentUser(token);
          set({ user: updatedUser, isLoading: false });
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

// Hook para verificar autenticación en el cliente
export const useIsAuthenticated = () => {
  return useAuthStore((state) => state.isAuthenticated);
};

// Hook para obtener el usuario actual
export const useCurrentUser = () => {
  return useAuthStore((state) => state.user);
};

// Hook para verificar si está cargando
export const useAuthLoading = () => {
  return useAuthStore((state) => state.isLoading);
};

// Hook para obtener errores de autenticación
export const useAuthError = () => {
  return useAuthStore((state) => state.error);
};
