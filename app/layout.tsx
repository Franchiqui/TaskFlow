'use client';

'use client';

import './globals.css';
import '../zeus-icons.js';
import '../zeus-styles.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';

import { Providers } from '@/components/Providers';
import { ComponentSelectorHelper } from '@/components/component-selector-helper';



const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  

  // Check if we're in the main application context and prevent rendering
  // if we're not supposed to show the floating chat
  const isMainApp = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('mainApp') === 'true' ||
    window.location.pathname === '/editor'
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          
          <ComponentSelectorHelper />
          {children}
          
          
        </Providers>
      </body>
    </html>
  );
}