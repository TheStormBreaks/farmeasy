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

  const farmeasyLoginPath = '/farmeasy/login';
  const farmeasyKvkDefaultPath = '/farmeasy/kvk/announcements';
  const farmeasyFarmerDefaultPath = '/farmeasy/farmer/dashboard';
  const farmeasySupplyDefaultPath = '/farmeasy/supply/products';

  const syncState = useCallback((type: UserType, id: string | null) => {
      sessionUserType = type;
      sessionUserId = id;
      setUserType(type);
      setUserId(id);
  }, []);

  useEffect(() => {
    const currentUser = sessionUserType; 

    // Only apply auth logic if within the /farmeasy path
    if (!pathname.startsWith('/farmeasy')) {
        setIsLoading(false);
        return;
    }

    if (currentUser) {
      let expectedPathPrefix = '';
      if (currentUser === 'KVK') expectedPathPrefix = '/farmeasy/kvk';
      else if (currentUser === 'FARMER') expectedPathPrefix = '/farmeasy/farmer';
      else if (currentUser === 'SUPPLY') expectedPathPrefix = '/farmeasy/supply';

      let defaultPath = farmeasyLoginPath;
      if (currentUser === 'KVK') defaultPath = farmeasyKvkDefaultPath;
      else if (currentUser === 'FARMER') defaultPath = farmeasyFarmerDefaultPath;
      else if (currentUser === 'SUPPLY') defaultPath = farmeasySupplyDefaultPath;

      if (!pathname.startsWith(expectedPathPrefix) && pathname !== farmeasyLoginPath) {
        router.replace(defaultPath);
      }
    } else if (pathname !== farmeasyLoginPath) {
      router.replace(farmeasyLoginPath);
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
    router.push(farmeasyLoginPath); 
  }, [router, syncState, farmeasyLoginPath]);

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
