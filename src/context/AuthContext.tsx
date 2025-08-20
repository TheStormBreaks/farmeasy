// src/context/AuthContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { UserType } from '@/types';

interface AuthContextType {
  userType: UserType;
  login: (type: UserType) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let sessionUserType: UserType = null;
let sessionUserId: string | null = null;

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [userType, setUserType] = useState<UserType>(sessionUserType);
  const [userId, setUserId] = useState<string | null>(sessionUserId);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const syncState = useCallback((type: UserType, id: string | null) => {
      sessionUserType = type;
      sessionUserId = id;
      setUserType(type);
      setUserId(id);
  }, []);

  useEffect(() => {
    const currentUser = sessionUserType;
    const loginPath = '/farmeasy/login';

    if (currentUser) {
      let expectedPathPrefix = '';
      if (currentUser === 'KVK') expectedPathPrefix = '/farmeasy/kvk';
      else if (currentUser === 'FARMER') expectedPathPrefix = '/farmeasy/farmer';
      else if (currentUser === 'SUPPLY') expectedPathPrefix = '/farmeasy/supply';

      let defaultPath = loginPath;
      if (currentUser === 'KVK') defaultPath = '/farmeasy/kvk/announcements';
      else if (currentUser === 'FARMER') defaultPath = '/farmeasy/farmer/ai-assistant';
      else if (currentUser === 'SUPPLY') defaultPath = '/farmeasy/supply/products';

      if (!pathname.startsWith(expectedPathPrefix) && pathname !== loginPath) {
        router.replace(defaultPath);
      }
    } else if (!pathname.startsWith('/farmeasy')) {
        // If not logged in and not in a farmeasy path, do nothing (allow cyberhertz pages)
    }
    else if (pathname !== loginPath) {
      router.replace(loginPath);
    }
    setIsLoading(false);
  }, [pathname, router]);

  const login = useCallback((type: UserType) => {
    if (type) {
      syncState(type, type);
    } else {
        syncState(null, null);
    }
  }, [syncState]);

  const logout = useCallback(() => {
    syncState(null, null);
    router.push('/farmeasy/login');
  }, [router, syncState]);

  const isAuthenticated = !!userType;

  return (
    <AuthContext.Provider value={{ userType, userId, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
