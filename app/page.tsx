'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';
import { format, isToday, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import Footer from '@/components/layout/footer';
import pb from '@/lib/pocketbase';

type TaskStatus='pending' | 'in_progress' | 'completed';
type TaskPriority='low' | 'medium' | 'high' | 'urgent';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
}

const taskSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100),
  description: z.string().max(500).optional(),
  dueDate: z.date(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'in_progress', 'completed'])
});

type TaskFormData = z.infer<typeof taskSchema>;

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente'
};

const statusLabels: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  completed: 'Completada'
};

interface PocketBaseTaskRecord {
  id: string;
  titulo?: string;
  descripcion?: string;
  fecha_vencimiento?: string;
  prioridad?: string;
  estado?: string;
  created?: string;
}

const pbPriorityToTaskPriority: Record<string, TaskPriority> = {
  baja: 'low',
  media: 'medium',
  alta: 'high',
  urgente: 'urgent'
};

const taskPriorityToPbPriority: Record<TaskPriority, string> = {
  low: 'baja',
  medium: 'media',
  high: 'alta',
  urgent: 'urgente'
};

const pbStatusToTaskStatus: Record<string, TaskStatus> = {
  pendiente: 'pending',
  'en progreso': 'in_progress',
  completada: 'completed'
};

const taskStatusToPbStatus: Record<TaskStatus, string> = {
  pending: 'pendiente',
  in_progress: 'en progreso',
  completed: 'completada'
};

const formatDateForPocketBase = (date: Date) => date.toISOString().split('T')[0];

const getAuthenticatedUserId = (): string | undefined => {
  return pb.authStore.model?.id;
};

const mapRecordToTask = (record: PocketBaseTaskRecord): Task => {
  const priorityKey = record.prioridad ?? '';
  const statusKey = record.estado ?? '';
  const priority = priorityKey ? pbPriorityToTaskPriority[priorityKey] ?? 'medium' : 'medium';
  const status = statusKey ? pbStatusToTaskStatus[statusKey] ?? 'pending' : 'pending';

  return {
    id: record.id,
    title: record.titulo ?? '',
    description: record.descripcion ?? undefined,
    dueDate: record.fecha_vencimiento
      ? new Date(record.fecha_vencimiento)
      : new Date(record.created ?? Date.now()),
    priority,
    status,
    createdAt: record.created ? new Date(record.created) : new Date()
  };
};

const pocketBaseCollectionName = 'nueva_tarea';

const buildPocketBasePayload = (data: TaskFormData, userId: string) => ({
  titulo: data.title,
  descripcion: data.description ?? '',
  fecha_vencimiento: formatDateForPocketBase(data.dueDate),
  prioridad: taskPriorityToPbPriority[data.priority],
  estado: taskStatusToPbStatus[data.status]
  ,
  user: userId
});

type FilterType='all' | 'pending' | 'completed' | 'high';

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: new Date(),
      priority: 'medium',
      status: 'pending'
    }
  });

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('nueva_tarea').getFullList<PocketBaseTaskRecord>({
        sort: '-created'
      });
      setTasks(records.map(mapRecordToTask));
    } catch (error) {
      console.error('Error cargando tareas:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (editingTask) {
      setValue('title', editingTask.title);
      setValue('description', editingTask.description);
      setValue('dueDate', editingTask.dueDate);
      setValue('priority', editingTask.priority);
      setValue('status', editingTask.status);
      setShowTaskForm(true);
    }
  }, [editingTask, setValue]);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'high') return task.priority === 'high' || task.priority === 'urgent';
    return true;
  });

  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length,
    dueTodayTasks: tasks.filter(t => isToday(t.dueDate) && t.status !== 'completed').length
  };

  const handleCreateOrUpdateTask = useCallback(async (data: TaskFormData) => {
    setIsLoading(true);
    try {
      const currentUserId = getAuthenticatedUserId();

      if (!currentUserId) {
        throw new Error('Usuario no autenticado');
      }

      const payload = buildPocketBasePayload(data, currentUserId);

      if (editingTask) {
        const updated = await pb.collection(pocketBaseCollectionName).update(editingTask.id, payload);
        const updatedTask = mapRecordToTask(updated as PocketBaseTaskRecord);
        setTasks(prev => prev.map(task => (task.id === updatedTask.id ? updatedTask : task)));
      } else {
        const created = await pb.collection(pocketBaseCollectionName).create(payload);
        const newTask = mapRecordToTask(created as PocketBaseTaskRecord);
        setTasks(prev => [newTask, ...prev]);
      }

      reset();
      setEditingTask(null);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error guardando tarea:', error);
    } finally {
      setIsLoading(false);
    }
  }, [editingTask, reset]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    setIsLoading(true);
    try {
      await pb.collection(pocketBaseCollectionName).delete(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error eliminando tarea:', error);
    } finally {
      setShowDeleteConfirm(null);
      setIsLoading(false);
    }
  }, []);

  const handleToggleComplete = useCallback(async (taskId: string) => {
    setIsLoading(true);
    try {
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) return;

      const nextStatus: TaskStatus = currentTask.status === 'completed' ? 'pending' : 'completed';
      const updated = await pb.collection(pocketBaseCollectionName).update(taskId, {
        estado: taskStatusToPbStatus[nextStatus]
      });
      const updatedTask = mapRecordToTask(updated as PocketBaseTaskRecord);
      setTasks(prev => prev.map(task => (task.id === updatedTask.id ? updatedTask : task)));
    } catch (error) {
      console.error('Error actualizando estado de la tarea:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tasks]);

  const formatDate = useCallback((date: Date) => {
    return format(date, "dd/MM/yyyy", { locale: es });
  }, []);

  const isOverdue = useCallback((dueDate: Date) => {
    return isBefore(dueDate, new Date());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-gray-100 pb-24">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                TaskFlow
              </h1>
              <p className="text-gray-400 mt-1">Gestor de Tareas Colaborativo</p>
            </div>
            <button
              onClick={() => {
                setEditingTask(null);
                reset();
                setShowTaskForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
            >
              <Plus size={20} />
              Nueva Tarea
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Tareas</p>
                <p className="text-3xl font-bold mt-2">{stats.totalTasks}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <CheckSquare className="text-blue-400" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completadas</p>
                <p className="text-3xl font-bold mt-2 text-green-400">{stats.completedTasks}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="text-green-400" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pendientes</p>
                <p className="text-3xl font-bold mt-2 text-orange-400">{stats.pendingTasks}</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Clock className="text-orange-400" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Vencen Hoy</p>
                <p className={`text-3xl font-bold mt-2 ${stats.dueTodayTasks > 0 ? 'text-red-400' : ''}`}>
                  {stats.dueTodayTasks}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <AlertCircle className="text-red-400" size={24} />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold">Mis Tareas</h2>
              
              <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'completed', 'high'] as FilterType[]).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === filterType
                        ? filterType === 'high' 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : filterType === 'completed'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : filterType === 'pending'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700'
                    }`}
                  >
                    {filterType === 'all' && 'Todas'}
                    {filterType === 'pending' && 'Pendientes'}
                    {filterType === 'completed' && 'Completadas'}
                    {filterType === 'high' && 'Alta Prioridad'}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center items-center h-64"
                >
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </motion.div>
              ) : filteredTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700"
                >
                  <Filter size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-500">No hay tareas que coincidan con el filtro</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {filteredTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border ${
                        isOverdue(task.dueDate) && task.status !== 'completed'
                          ? 'border-red-500/50'
                          : 'border-gray-700'
                      } shadow-lg hover:shadow-xl transition-shadow`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleComplete(task.id)}
                            className={`p-1 rounded ${
                              task.status === 'completed'
                                ? 'text-green-400 bg-green-400/10'
                                : 'text-gray-400 hover:text-green-400 hover:bg-green-400/10'
                            }`}
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle size={20} />
                            ) : (
                              <Square size={20} />
                            )}
                          </button>
                          <h3 className={`font-semibold ${
                            task.status === 'completed'
                              ? 'line-through text-gray-500'
                              : 'text-white'
                          }`}>
                            {task.title}
                          </h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                          {priorityLabels[task.priority]}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700/50">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar size={16} />
                          <span className={isOverdue(task.dueDate) && task.status !== 'completed' ? 'text-red-400' : ''}>
                            Vence: {formatDate(task.dueDate)}
                            {isOverdue(task.dueDate) && task.status !== 'completed' && (
                              <span className="ml-2 text-xs bg-red-500/20 px-2 py-1 rounded">Atrasada</span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            task.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : task.status === 'in_progress'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-orange-500/20 text-orange-400'
                          }`}>
                            {statusLabels[task.status]}
                          </span>

                          <button
                            onClick={() => setEditingTask(task)}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Editar tarea"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            onClick={() => setShowDeleteConfirm(task.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Eliminar tarea"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <AnimatePresence>
              {showTaskForm && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg sticky top-8"
                >
                  <h3 className="text-xl font-bold mb-6">
                    {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
                  </h3>

                  <form onSubmit={handleSubmit(handleCreateOrUpdateTask)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Título *
                      </label>
                      <input
                        {...register('title')}
                        className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ingresa el título de la tarea"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Descripción
                      </label>
                      <textarea
                        {...register('description')}
                        className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                        placeholder="Describe la tarea (opcional)"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fecha de Vencimiento *
                      </label>
                      <input
                        type="date"
                        {...register('dueDate', { valueAsDate: true })}
                        className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.dueDate && (
                        <p className="mt-1 text-sm text-red-400">{errors.dueDate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Prioridad
                      </label>
                      <select
                        {...register('priority')}
                        className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Estado
                      </label>
                      <select
                        {...register('status')}
                        className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="in_progress">En Progreso</option>
                        <option value="completed">Completada</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Guardando...' : editingTask ? 'Actualizar' : 'Crear'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowTaskForm(false);
                          setEditingTask(null);
                          reset();
                        }}
                        className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            key="delete-confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-white mb-3">¿Eliminar tarea?</h3>
              <p className="text-sm text-gray-400 mb-5">
                Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar esta tarea?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (showDeleteConfirm) {
                      handleDeleteTask(showDeleteConfirm);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
