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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In-memory store for user type during session (client-side)
let sessionUserType: UserType = null;

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [userType, setUserType] = useState<UserType>(sessionUserType);
  const [isLoading, setIsLoading] = useState(true); // Still useful for initial load/redirect checks
  const router = useRouter();
  const pathname = usePathname();

  const syncState = useCallback((type: UserType) => {
      sessionUserType = type;
      setUserType(type);
  }, []);

  // Effect to handle initial authentication state check and redirection logic
  useEffect(() => {
    // Simulate an async check if needed, otherwise just set loading false
    // In a real app, this might involve checking a token or session
    const currentUser = sessionUserType; // Use the in-memory value

    if (currentUser) {
      // User is logged in (in this session)
      const expectedPathPrefix = currentUser === 'KVK' ? '/kvk' : '/farmer';
      if (!pathname.startsWith(expectedPathPrefix) && pathname !== '/login') {
        // Redirect to the correct dashboard if not already there
        router.replace(currentUser === 'KVK' ? '/kvk/announcements' : '/farmer/dashboard');
      }
    } else if (pathname !== '/login') {
      // No user in session and not on login page, redirect to login
      router.replace('/login');
    }
    setIsLoading(false); // Finished checking
  }, [pathname, router]);

  const login = useCallback((type: UserType) => {
    syncState(type);
    // Redirect happens in the LoginForm after successful login now
  }, [syncState]);

  const logout = useCallback(() => {
    syncState(null); // Clear session state
    router.push('/login'); // Redirect to login page
  }, [router, syncState]);

  const isAuthenticated = !!userType;

  return (
    <AuthContext.Provider value={{ userType, login, logout, isAuthenticated, isLoading }}>
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
