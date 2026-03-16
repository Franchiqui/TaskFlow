export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  user: User;
  expires: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

// Task types
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  dueDate: Date;
  priority: TaskPriority;
  status?: TaskStatus;
}

export interface TaskUpdateInput extends Partial<TaskCreateInput> {
  id: string;
}

export interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority;
  search?: string;
}

// Dashboard types
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  tasksDueToday: number;
}

export interface TaskDistribution {
  pending: number;
  'in-progress': number;
  completed: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form validation schemas
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').min(1, 'Email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'La confirmación es requerida'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const taskSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es demasiado largo'),
  description: z.string().max(500, 'La descripción es demasiado larga').optional(),
  dueDate: z.date().min(new Date(), 'La fecha límite debe ser futura'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
});

// Component props types
export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface ConfirmationModalProps extends Omit<ModalProps, 'children'> {
  message: string;
  onConfirm: () => void | Promise<void>;
}

// Store types
export interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export interface TaskStore {
  tasks: Task[];
  filteredTasks: Task[];
  selectedTask?: Task | null;
  
  isLoading: boolean;
  
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  createTask: (taskData: TaskCreateInput) => Promise<void>;
  updateTask: (taskId: string, taskData: TaskUpdateInput) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  
  setSelectedTask: (task?: Task | null) => void;
  
  getStats: () => DashboardStats;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartProps {
  data: ChartDataPoint[];
}

// Utility types
export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

// Next.js specific types
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

export type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void> | void;

export type RouteHandler = (
  req: NextRequest,
) => Promise<NextResponse> | NextResponse;

// Environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXTAUTH_URL?: string;
      NEXTAUTH_SECRET?: string;
      DATABASE_URL?: string;
      JWT_SECRET?: string;
      NEXT_PUBLIC_APP_URL?: string;
    }
  }
}