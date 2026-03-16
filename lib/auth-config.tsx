'use client';

export const authPaths = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  dashboard: '/dashboard',
  profile: '/profile',
  logout: '/auth/logout',
} as const;

export type AuthPaths = typeof authPaths;

export interface AuthConfig {
  publicRoutes: string[];
  protectedRoutes: string[];
  authRoutes: string[];
}

export const authConfig: AuthConfig = {
  publicRoutes: ['/', '/about', '/contact'],
  protectedRoutes: ['/dashboard', '/profile', '/settings'],
  authRoutes: ['/auth/login', '/auth/register', '/auth/logout'],
};

export function isPublicRoute(path: string): boolean {
  return authConfig.publicRoutes.includes(path);
}

export function isProtectedRoute(path: string): boolean {
  return authConfig.protectedRoutes.some(route => 
    path === route || path.startsWith(route + '/')
  );
}

export function isAuthRoute(path: string): boolean {
  return authConfig.authRoutes.includes(path);
}

export function shouldRedirectToLogin(path: string): boolean {
  return isProtectedRoute(path) && !isAuthRoute(path);
}

export function shouldRedirectToHome(path: string): boolean {
  return isAuthRoute(path) && path !== authPaths.logout;
}

export function getRedirectPath(currentPath: string, isAuthenticated: boolean): string | null {
  if (isAuthenticated && shouldRedirectToHome(currentPath)) {
    return authPaths.home;
  }
  
  if (!isAuthenticated && shouldRedirectToLogin(currentPath)) {
    return authPaths.login;
  }
  
  return null;
}

export const authCookieName = 'pb_auth';

export function getAuthTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === authCookieName) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export function clearAuthCookie(): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${authCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export interface UserSession {
  id: string;
  email: string;
  username?: string;
  avatar?: string;
  verified: boolean;
}

export function parseUserFromToken(token: string): UserSession | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      email: payload.email,
      username: payload.username,
      avatar: payload.avatar,
      verified: payload.verified || false,
    };
  } catch {
    return null;
  }
}

export function validatePassword(password: string): {
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

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const authErrors = {
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  USER_NOT_FOUND: 'Usuario no encontrado',
  EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
  WEAK_PASSWORD: 'Contraseña demasiado débil',
  NETWORK_ERROR: 'Error de conexión',
  SESSION_EXPIRED: 'Sesión expirada',
  UNAUTHORIZED: 'No autorizado',
} as const;

export type AuthError = keyof typeof authErrors;

export function getAuthErrorMessage(error: AuthError | string): string {
  if (error in authErrors) {
    return authErrors[error as AuthError];
  }
  return 'Error de autenticación';
}
