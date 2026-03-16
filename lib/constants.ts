export const APP_NAME = 'TaskFlow';
export const APP_DESCRIPTION = 'Gestor de Tareas Colaborativo';

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    SESSION: '/api/auth/session',
  },
  TASKS: {
    BASE: '/api/tasks',
    BY_ID: (id: string) => `/api/tasks/${id}`,
    STATS: '/api/tasks/stats',
  },
} as const;

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
} as const;

export const TASK_PRIORITIES = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
} as const;

export type TaskPriority = typeof TASK_PRIORITIES[keyof typeof TASK_PRIORITIES];

export const TASK_STATUSES = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
} as const;

export type TaskStatus = typeof TASK_STATUSES[keyof typeof TASK_STATUSES];

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TASK_PRIORITIES.LOW]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [TASK_PRIORITIES.MEDIUM]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [TASK_PRIORITIES.HIGH]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  [TASK_PRIORITIES.URGENT]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  [TASK_STATUSES.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [TASK_STATUSES.IN_PROGRESS]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [TASK_STATUSES.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export const FILTER_OPTIONS = {
  ALL: 'Todas',
  PENDING: 'Pendientes',
  COMPLETED: 'Completadas',
  HIGH_PRIORITY: 'Alta prioridad',
} as const;

export type TaskFilter = typeof FILTER_OPTIONS[keyof typeof FILTER_OPTIONS];

export const DATE_FORMATS = {
  DISPLAY_DATE: 'dd/MM/yyyy',
  DISPLAY_DATETIME: 'dd/MM/yyyy HH:mm',
  API_DATE: 'yyyy-MM-dd',
} as const;

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
} as const;

export const LOCAL_STORAGE_KEYS = {
  THEME: 'taskflow-theme',
  RECENT_FILTERS: 'taskflow-recent-filters',
} as const;

export const QUERY_KEYS = {
  TASKS: 'tasks',
  TASK_STATS: 'task-stats',
  USER_PROFILE: 'user-profile',
} as const;

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Este campo es requerido',
  INVALID_EMAIL: 'Email inválido',
  PASSWORD_TOO_SHORT: `La contraseña debe tener al menos ${VALIDATION.PASSWORD_MIN_LENGTH} caracteres`,
  TITLE_TOO_LONG: `El título no puede exceder ${VALIDATION.TITLE_MAX_LENGTH} caracteres`,
  DESCRIPTION_TOO_LONG: `La descripción no puede exceder ${VALIDATION.DESCRIPTION_MAX_LENGTH} caracteres`,
  NETWORK_ERROR: 'Error de conexión. Por favor, intenta nuevamente.',
  UNAUTHORIZED: 'No autorizado. Por favor, inicia sesión.',
} as const;

export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Tarea creada exitosamente',
  TASK_UPDATED: 'Tarea actualizada exitosamente',
  TASK_DELETED: 'Tarea eliminada exitosamente',
  PROFILE_UPDATED: 'Perfil actualizado exitosamente',
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const DEFAULT_PAGINATION = {
  PAGE_SIZE: 10,
} as const;