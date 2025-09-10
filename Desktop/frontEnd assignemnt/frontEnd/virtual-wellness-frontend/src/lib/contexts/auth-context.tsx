"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/lib/api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication on mount
    try {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
        } catch (error) {
          // Clear invalid stored data
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      // Handle localStorage access errors (SSR)
      console.warn('localStorage not available:', error);
    }
    
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    try {
      localStorage.setItem('access_token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      // Also set cookie for middleware (httpOnly not possible on client; basic cookie works)
      document.cookie = `access_token=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Clear cookie so middleware detects logout immediately
      document.cookie = 'access_token=; path=/; max-age=0';
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
