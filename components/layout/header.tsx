'use client';

'use client';

import React, { memo, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Transition } from '@headlessui/react';
import { 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '@/lib/store/auth-store';

interface HeaderProps {
  showMobileMenu: boolean;
  onMobileMenuToggle: () => void;
}

const Header = memo(function Header({ 
  showMobileMenu, 
  onMobileMenuToggle 
}: HeaderProps) {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, router, isLoggingOut]);

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', current: true },
    { name: 'Tareas', href: '/tasks', current: false },
    { name: 'Equipo', href: '/team', current: false },
    { name: 'Reportes', href: '/reports', current: false },
  ];

  const userNavigation = [
    { name: 'Tu perfil', href: '/profile', icon: UserCircleIcon },
    { name: 'Configuración', href: '/settings', icon: Cog6ToothIcon },
    { name: 'Cerrar sesión', href: '#', icon: ArrowRightOnRectangleIcon, onClick: handleLogout },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              onClick={onMobileMenuToggle}
              aria-expanded={showMobileMenu}
              aria-label={showMobileMenu ? 'Cerrar menú' : 'Abrir menú'}
            >
              <span className="sr-only">Abrir menú principal</span>
              {showMobileMenu ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
            
            <div className="flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">TF</span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    TaskFlow
                  </span>
                </button>
              </motion.div>
            </div>

            <nav className="hidden lg:ml-10 lg:block">
              <div className="flex space-x-4">
                {navigationItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={twMerge(
                      clsx(
                        item.current
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                        'rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200'
                      )
                    )}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </nav>
          </div>

          <div className="hidden lg:ml-4 lg:flex lg:items-center">
            {isAuthenticated && user ? (
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                    <span className="sr-only">Abrir menú de usuario</span>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Menu.Button>
                </div>
                <Transition
                  as={React.Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm font-medium text-white truncate">{user.name || user.email}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    {userNavigation.map((item) => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <a
                            href={item.href}
                            onClick={(e) => {
                              if (item.onClick) {
                                e.preventDefault();
                                item.onClick();
                              }
                            }}
                            className={twMerge(
                              clsx(
                                active ? 'bg-gray-700' : '',
                                'flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors duration-150'
                              )
                            )}
                          >
                            <item.icon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                            {item.name}
                          </a>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/login')}
                  className="rounded-md px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="rounded-md bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>

          <div className="flex lg:hidden">
            {isAuthenticated && user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center rounded-full bg-gray-800 p-1 text-sm focus:outline-none focus:ring -2 focus:ring-blue -500">
                  <span className="sr-only">Abrir menú de usuario</span>
                  <div className="h1 -8 w -8 rounded-full bg-gradient-to-br from-blue -500 to-purple -600 flex items-center justify-center">
                    <span className="text-white font-medium text-xs">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Menu.Button>
                <Transition
                  as={React.Fragment}
                  enter="transition ease-out duration -100"
                  enterFrom="transform opacity -0 scale -95"
                  enterTo="transform opacity -100 scale -100"
                  leave="transition ease-in duration -75"
                  leaveFrom="transform opacity -100 scale -100"
                  leaveTo="transform opacity -0 scale -95"
                >
                  <Menu.Items className="absolute right -0 z -10 mt -2 w -48 origin-top-right rounded-md bg-gray -800 py -1 shadow-lg ring -1 ring-black ring-opacity -5 focus:outline-none">
                    {userNavigation.map((item) => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <a
                            href={item.href}
                            onClick={(e) => {
                              if (item.onClick) {
                                e.preventDefault();
                                item.onClick();
                              }
                            }}
                            className={twMerge(
                              clsx(
                                active ? 'bg-gray -700' : '',
                                'flex items-center px -4 py -2 text-sm text-gray -300 hover:text-white'
                              )
                            )}
                          >
                            <item.icon className="mr -3 h -5 w -5 text-gray -400" aria-hidden="true" />
                            {item.name}
                          </a>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="rounded-md bg-gradient-to-r from-blue -500 to-purple -600 px -4 py -2 text-sm font-medium text-white"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-gray -800 bg-gray -900"
          >
            <div className="space-y -1 px -2 pt -2 pb -3">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={twMerge(
                    clsx(
                      item.current
                        ? 'bg-gray -800 text-white'
                        : 'text-gray -300 hover:bg-gray -800 hover:text-white',
                      'block rounded-md px -3 py -2 text-base font-medium'
                    )
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});

export default Header;