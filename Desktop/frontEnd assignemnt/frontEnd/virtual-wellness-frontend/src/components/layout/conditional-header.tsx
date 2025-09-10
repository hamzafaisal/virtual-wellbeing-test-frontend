"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { ClientHeader } from './client-header';

export function ConditionalHeader() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  
  if (pathname === '/login' || !isAuthenticated) {
    return null;
  }
  
  return <ClientHeader />;
}