'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { UserType } from '@/types';

interface AuthContextType {
  userType: UserType;
  login: (type: UserType) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean; // Added loading state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [userType, setUserType] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(true); // Initialize loading as true
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check local storage for persisted user type on initial load
    try {
      const storedUserType = localStorage.getItem('userType') as UserType;
      if (storedUserType) {
        setUserType(storedUserType);
        // Redirect based on persisted type if not already on the correct path
        const expectedPathPrefix = storedUserType === 'KVK' ? '/kvk' : '/farmer';
         if (!pathname.startsWith(expectedPathPrefix) && pathname !== '/login') {
           router.replace(storedUserType === 'KVK' ? '/kvk/announcements' : '/farmer/dashboard');
         }
      } else if (pathname !== '/login') {
        // If no user type and not on login page, redirect to login
         router.replace('/login');
      }
    } catch (error) {
        console.error("Error accessing localStorage:", error);
        // Handle potential SecurityError in restricted environments (e.g., private browsing)
         if (pathname !== '/login') {
            router.replace('/login');
         }
    } finally {
        setIsLoading(false); // Set loading to false after check
    }
  }, [pathname, router]);


  const login = (type: UserType) => {
    setUserType(type);
     try {
        if (type) {
          localStorage.setItem('userType', type);
        } else {
          localStorage.removeItem('userType');
        }
     } catch (error) {
        console.error("Error accessing localStorage:", error);
     }
  };

  const logout = () => {
    setUserType(null);
    try {
        localStorage.removeItem('userType');
        localStorage.removeItem('announcements'); // Clear announcements on logout
    } catch (error) {
        console.error("Error accessing localStorage:", error);
    }
    router.push('/login');
  };

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
