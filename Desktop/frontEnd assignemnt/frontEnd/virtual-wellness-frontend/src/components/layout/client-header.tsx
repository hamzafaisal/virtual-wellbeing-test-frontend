"use client";

import { useAuth } from '@/lib/contexts/auth-context';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navigation } from './navigation';

export function ClientHeader() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-gray-200 bg-white px-6 py-4">
      <div className="flex items-center gap-4 text-gray-800">
        <div className="size-8 text-[var(--primary-color)]">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900">
        Virtual Wellbeing
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <Navigation />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="h-4 w-4" />
              <span>{user?.name || 'Admin'}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
