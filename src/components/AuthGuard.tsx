// src/components/AuthGuard.tsx
'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { UserType } from '@/types';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface AuthGuardProps {
  children: ReactNode;
  requiredUserType: UserType | UserType[]; // Allow single or array of types
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredUserType }) => {
  const { userType, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const requiredTypes = Array.isArray(requiredUserType) ? requiredUserType : [requiredUserType];

  useEffect(() => {
    if (isLoading) {
      return; // Don't redirect while loading initial state
    }

    if (!isAuthenticated) {
      // If not authenticated, redirect to login
       if (pathname !== '/login') {
          router.replace('/login');
       }
       return; // Stop further checks if redirecting to login
    }

    // Check if the current userType is allowed for this route
    const isAuthorized = requiredTypes.some(type => type === userType);

    if (!isAuthorized) {
        // If authenticated but wrong user type, redirect based on actual type
        let redirectPath = '/login'; // Default fallback
        if (userType === 'KVK') redirectPath = '/kvk/announcements';
        else if (userType === 'FARMER') redirectPath = '/farmer/dashboard';
        else if (userType === 'SUPPLY') redirectPath = '/supply/products';

         // Prevent infinite redirect loop if already on the correct page or login
        if (pathname !== redirectPath && pathname !== '/login') {
           router.replace(redirectPath);
        }
    }


  }, [isAuthenticated, userType, requiredTypes, router, isLoading, pathname]);

  const isAuthorized = requiredTypes.some(type => type === userType);

   // Show loading skeleton or null while checking auth/redirecting,
   // or if user is not authorized for the current route yet.
  if (isLoading || !isAuthenticated || !isAuthorized) {
       // Ensure we don't show loading skeleton on the login page itself if user is already logged out
       if (pathname === '/login' && !isAuthenticated && !isLoading) {
           return <>{children}</>; // Show login page content if not authenticated and not loading
       }

       // For protected routes, show skeleton while loading or if unauthorized (before redirect happens)
       if(pathname !== '/login') {
           return (
              <div className="flex flex-col space-y-3 p-8 min-h-screen">
                <Skeleton className="h-[125px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[calc(100%-50px)]" />
                </div>
              </div>
            );
       }
       // Fallback for login page during initial load if needed
       return null;
  }


  // If authenticated and correct user type, render children
  return <>{children}</>;
};

export default AuthGuard;
