import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').min(1, 'Email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100),
  confirmPassword: z.string().min(6, 'La confirmación de contraseña debe tener al menos 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const taskSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'El título no puede exceder 200 caracteres'),
  description: z.string().max(1000, 'La descripción no puede exceder 1000 caracteres').optional(),
  dueDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
});

export const updateTaskSchema = taskSchema.partial();

export const userProfileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').min(1, 'Email es requerido'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePasswordStrength = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe contener al menos una letra mayúscula' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'La contraseña debe contener al menos un número' };
  }
  
  return { valid: true };
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 1000);
};

export const validateDueDate = (date: Date): { valid: boolean; message?: string } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date < today) {
    return { valid: false, message: 'La fecha límite no puede ser en el pasado' };
  }
  
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() + 1);
  
  if (date > maxDate) {
    return { valid: false, message: 'La fecha límite no puede ser mayor a un año' };
  }
  
  return { valid: true };
};

export const validateTaskTitle = (title: string): { valid: boolean; message?: string } => {
  if (!title.trim()) {
    return { valid: false, message: 'El título es requerido' };
  }
  
  if (title.length > 200) {
    return { valid: false, message: 'El título no puede exceder 200 caracteres' };
  }
  
  if (/[<>]/.test(title)) {
    return { valid: false, message: 'El título contiene caracteres no permitidos' };
  }
  
  return { valid: true };
};

export const validateTaskDescription = (description?: string): { valid: boolean; message?: string } => {
  if (!description) return { valid: true };
  
  if (description.length > 1000) {
    return { valid: false, message: 'La descripción no puede exceder 1000 caracteres' };
  }
  
  if (/[<>]/.test(description)) {
    return { valid: false, message: 'La descripción contiene caracteres no permitidos' };
  }
  
  return { valid: true };
};

export const getPriorityColor = (priority: TaskInput['priority']): string => {
  switch (priority) {
    case 'low': return '#10b981';
    case 'medium': return '#3b82f6';
    case 'high': return '#f59e0b';
    case 'urgent': return '#ef4444';
    default: return '#6b7280';
  }
};

export const getStatusColor = (status: TaskInput['status']): string => {
  switch (status) {
    case 'pending': return '#f59e0b';
    case 'in_progress': return '#3b82f6';
    case 'completed': return '#10b981';
    default: return '#6b7280';
  }
};

export const formatDateForInput = (date?: Date): string => {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export const parseDateFromInput = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return null;
  }
  
  date.setHours(12, 0, 0, 0);
  
  return date;
};