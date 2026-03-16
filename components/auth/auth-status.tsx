'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import pb from '@/lib/pocketbase';
import { authPaths } from '@/lib/auth-config';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

/** Rutas opcionales para reutilizar en otra app. Por defecto usa authPaths de lib/auth-config */
export interface AuthStatusPaths {
  login?: string;
  register?: string;
  home?: string;
  profile?: string;
  settings?: string;
}

interface AuthStatusProps {
  /** Rutas personalizadas (ej. al mover a otra app) */
  paths?: AuthStatusPaths;
}

export default function AuthStatus({ paths = {} }: AuthStatusProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const loginPath = paths.login ?? authPaths.login;
  const registerPath = paths.register ?? authPaths.register;
  const homePath = paths.home ?? authPaths.home;
  const profilePath = paths.profile ?? authPaths.profile;
  const settingsPath = paths.settings ?? authPaths.settings;

  useEffect(() => {
    setLoading(true);
    try {
      pb.authStore.loadFromCookie(document.cookie);
      if (pb.authStore.isValid && pb.authStore.model) {
        const model = pb.authStore.model as Record<string, unknown>;
        const collectionId = (model as { collectionId?: string }).collectionId;
        const avatar = (model as { avatar?: string }).avatar;
        setUser({
          id: (model.id as string) ?? '',
          name: (model.name as string) || (model.username as string) || (model.email as string) || 'Usuario',
          email: (model.email as string) ?? '',
          avatar: collectionId && avatar
            ? pb.baseUrl + '/api/files/' + collectionId + '/' + (model.id as string) + '/' + avatar
            : undefined,
        });
      } else {
        setUser(null);
      }
      const unsubscribe = pb.authStore.onChange((token, model) => {
        if (token && model) {
          const data = model as Record<string, unknown>;
          const collectionId = (data as { collectionId?: string }).collectionId;
          const avatar = (data as { avatar?: string }).avatar;
          setUser({
            id: (data.id as string) ?? '',
            name: (data.name as string) || (data.username as string) || (data.email as string) || 'Usuario',
            email: (data.email as string) ?? '',
            avatar: collectionId && avatar
              ? pb.baseUrl + '/api/files/' + collectionId + '/' + (data.id as string) + '/' + avatar
              : undefined,
          });
          router.refresh();
        } else {
          setUser(null);
          router.push(loginPath);
          router.refresh();
        }
      });
      return () => unsubscribe?.();
    } catch (error) {
      console.error('Error leyendo sesión:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [loginPath, router]);

  const handleLogout = () => {
    pb.authStore.clear();
    document.cookie = 'pb_auth=; Path=/; Max-Age=0';
    setUser(null);
    router.push(loginPath);
    router.refresh();
  };

  const handleProfileClick = () => {
    if (profilePath && profilePath !== '#') {
      router.push(profilePath);
      setDropdownOpen(false);
    }
  };

  const handleSettingsClick = () => {
    if (settingsPath && settingsPath !== '#') {
      router.push(settingsPath);
      setDropdownOpen(false);
    }
  };

  const showProfile = profilePath && profilePath !== '#';
  const showSettings = settingsPath && settingsPath !== '#';

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 hidden md:block">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(loginPath)}
          className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950"
        >
          Iniciar sesión
        </Button>
        <Button size="sm" onClick={() => router.push(registerPath)} className="bg-blue-600 hover:bg-blue-700">
          Registrarse
        </Button>
      </div>
    );
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{user.email}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-gray-500 truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {showProfile && (
          <DropdownMenuItem onClick={handleProfileClick}>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
        )}
        {showSettings && (
          <DropdownMenuItem onClick={handleSettingsClick}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </DropdownMenuItem>
        )}
        {(showProfile || showSettings) && <DropdownMenuSeparator />}
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
