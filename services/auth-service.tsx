'use client';

import axios, { AxiosError, AxiosResponse } from 'axios';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role?: string;
  createdAt?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Configuración base de axios
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    // El token se agregará dinámicamente en cada llamada
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globales
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const apiError = error.response.data;
      
      // Formatear errores de validación
      if (apiError.errors) {
        const validationErrors = Object.entries(apiError.errors)
          .map(([field, messages]) => 
            messages.map(message => `${field}: ${message}`)
          )
          .flat()
          .join(', ');
        
        throw new Error(validationErrors || apiError.message);
      }
      
      throw new Error(apiError.message || 'Error en la solicitud');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error('Error en la configuración de la solicitud');
    }
  }
);

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public setToken(token: string | null): void {
    this.token = token;
  }

  public getToken(): string | null {
    return this.token;
  }

  public async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { user, token } = response.data;
      this.setToken(token);

      return { user, token };
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiError;
        throw new Error(apiError?.message || 'Credenciales inválidas');
      }
      throw error;
    }
  }

  public async register(email: string, password: string, name?: string): Promise<RegisterResponse> {
    try {
      const response: AxiosResponse<RegisterResponse> = await apiClient.post('/auth/register', {
        email,
        password,
        name,
      });

      const { user, token } = response.data;
      this.setToken(token);

      return { user, token };
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiError;
        
        // Manejo específico de errores de validación
        if (apiError.errors) {
          const errorMessages = Object.values(apiError.errors).flat();
          throw new Error(errorMessages.join(', '));
        }
        
        throw new Error(apiError?.message || 'Error en el registro');
      }
      throw error;
    }
  }

  public async logout(token: string): Promise<void> {
    try {
      await apiClient.post(
        '/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      // No lanzamos error en logout para que siempre se pueda cerrar sesión
      console.warn('Error during logout API call:', error);
    } finally {
      this.setToken(null);
    }
  }

  public async getCurrentUser(token: string): Promise<User> {
    try {
      const response: AxiosResponse<{ user: User }> = await apiClient.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.user;
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiError;
        
        if (error.response?.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        }
        
        throw new Error(apiError?.message || 'Error al obtener información del usuario');
      }
      throw error;
    }
  }

  public async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const response: AxiosResponse<{ token: string }> = await apiClient.post('/auth/refresh', {
        refreshToken,
      });

      const { token } = response.data;
      this.setToken(token);

      return { token };
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiError;
        throw new Error(apiError?.message || 'Error al renovar el token');
      }
      throw error;
    }
  }

  public async resetPassword(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', { email });
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiError;
        throw new Error(apiError?.message || 'Error al solicitar restablecimiento de contraseña');
      }
      throw error;
    }
  }

  public async updateProfile(
    token: string,
    updates: Partial<{
      name: string;
      avatarUrl: string;
    }>
  ): Promise<User> {
    try {
      const response: AxiosResponse<{ user: User }> = await apiClient.patch(
        '/auth/profile',
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.user;
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiError;
        throw new Error(apiError?.message || 'Error al actualizar el perfil');
      }
      throw error;
    }
  }

  public async changePassword(
    token: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      await apiClient.post(
        '/auth/change-password',
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiError;
        throw new Error(apiError?.message || 'Error al cambiar la contraseña');
      }
      throw error;
    }
  }

  public async verifyEmail(token: string): Promise<void> {
    try {
      await apiClient.post('/auth/verify-email', { token });
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiError;
        throw new Error(apiError?.message || 'Error al verificar el email');
      }
      throw error;
    }
  }

  public async resendVerificationEmail(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/resend-verification', { email });
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiError;
        throw new Error(apiError?.message || 'Error al reenviar email de verificación');
      }
      throw error;
    }
  }

  // Método para validar fortaleza de contraseña
  public validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Método para validar formato de email
  public validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Exportar una instancia única del servicio
export const authService = AuthService.getInstance();
