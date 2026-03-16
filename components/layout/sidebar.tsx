'use client';

'use client';

import React, { memo, useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Tareas', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Calendario', href: '/calendar', icon: CalendarDaysIcon },
  { name: 'Reportes', href: '/reports', icon: ChartBarIcon },
  { name: 'Configuración', href: '/settings', icon: Cog6ToothIcon },
];

export const Sidebar = memo(function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const toggleSidebar = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const isActive = useCallback(
    (href: string) => {
      if (href === '/dashboard') {
        return pathname === '/dashboard';
      }
      return pathname?.startsWith(href);
    },
    [pathname]
  );

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out',
          collapsed ? 'w-20' : 'w-64',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center space-x-3 text-white font-bold text-xl truncate',
              collapsed && 'justify-center'
            )}
            onClick={closeMobileSidebar}
          >
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <span className="truncate">
                Task<span className="text-blue-400">Flow</span>
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden lg:inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            aria-label={collapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
          >
            {collapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobileSidebar}
                className={cn(
                  'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors',
                  active
                    ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/30 text-white border-l-4 border-blue-500'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <item.icon
                  className={cn(
                    'flex-shrink-0 h-5 w-5 transition-colors',
                    active ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300',
                    collapsed ? 'mx-auto' : 'mr-3'
                  )}
                  aria-hidden="true"
                />
                {!collapsed && (
                  <span className="truncate transition-opacity duration-200">
                    {item.name}
                  </span>
                )}
                {!collapsed && active && (
                  <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-700 p-4">
          <div className={cn('flex items-center', collapsed ? 'justify-center' : 'space-x-3')}>
            <div className="flex-shrink-0">
              {user?.avatarUrl ? (
                <img
                  className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                  src={user.avatarUrl}
                  alt={user.name || 'Usuario'}
                />
              ) : (
                <UserCircleIcon className="h-10 w-10 text-gray-400" />
              )}
            </div>
            {!collapsed && user && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={handleLogout}
                className="ml-auto p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
                aria-label="Cerrar sesión"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z1 bg-black bg-opacity -50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
});