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
  userId: string | null; // Simple user ID, could be 'KVK', 'FARMER', 'SUPPLY'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In-memory store for user type during session (client-side)
let sessionUserType: UserType = null;
let sessionUserId: string | null = null; // Store simple ID

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [userType, setUserType] = useState<UserType>(sessionUserType);
  const [userId, setUserId] = useState<string | null>(sessionUserId);
  const [isLoading, setIsLoading] = useState(true); // Still useful for initial load/redirect checks
  const router = useRouter();
  const pathname = usePathname();

  const syncState = useCallback((type: UserType, id: string | null) => {
      sessionUserType = type;
      sessionUserId = id;
      setUserType(type);
      setUserId(id);
  }, []);

  // Effect to handle initial authentication state check and redirection logic
  useEffect(() => {
    // Simulate an async check if needed, otherwise just set loading false
    // In a real app, this might involve checking a token or session
    const currentUser = sessionUserType; // Use the in-memory value

    if (currentUser) {
      // User is logged in (in this session)
      let expectedPathPrefix = '';
      if (currentUser === 'KVK') expectedPathPrefix = '/kvk';
      else if (currentUser === 'FARMER') expectedPathPrefix = '/farmer';
      else if (currentUser === 'SUPPLY') expectedPathPrefix = '/supply';

      let defaultPath = '/login';
      if (currentUser === 'KVK') defaultPath = '/kvk/announcements';
      else if (currentUser === 'FARMER') defaultPath = '/farmer/dashboard';
      else if (currentUser === 'SUPPLY') defaultPath = '/supply/products';


      if (!pathname.startsWith(expectedPathPrefix) && pathname !== '/login') {
        // Redirect to the correct dashboard if not already there
        router.replace(defaultPath);
      }
    } else if (pathname !== '/login') {
      // No user in session and not on login page, redirect to login
      router.replace('/login');
    }
    setIsLoading(false); // Finished checking
  }, [pathname, router]);

  const login = useCallback((type: UserType) => {
    if (type) {
      syncState(type, type); // Use the type itself as a simple ID
    } else {
        syncState(null, null);
    }
    // Redirect happens in the LoginForm after successful login now
  }, [syncState]);

  const logout = useCallback(() => {
    syncState(null, null); // Clear session state
    // Also clear any cart context if implemented separately
    router.push('/login'); // Redirect to login page
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
