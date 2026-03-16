'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import pb, { authCookieOptions } from '@/lib/pocketbase';
import { authPaths } from '@/lib/auth-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await pb.collection('users').authWithPassword(email, password);
      document.cookie = pb.authStore.exportToCookie(authCookieOptions);
      router.push(authPaths.home);
      router.refresh();
    } catch {
      setError('Credenciales inválidas');
    }
  };

  return (
    <main className="min-h-[calc(100vh-56px)] bg-gray-950 text-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/70 backdrop-blur border border-gray-700 rounded-xl p-6 sm:p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-white mb-6">Iniciar sesión</h1>
          {error && (
            <div className="text-red-400 text-sm mb-3" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-gray-200">
                Email
              </Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-gray-200">
                Contraseña
              </Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700 text-white">
              Entrar
            </Button>
          </form>
          <p className="mt-4 text-sm text-gray-400 text-center">
            ¿No tienes cuenta?{' '}
            <Link href={authPaths.register} className="text-blue-400 hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}


