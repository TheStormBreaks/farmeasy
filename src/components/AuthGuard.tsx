'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { UserType } from '@/types';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface AuthGuardProps {
  children: ReactNode;
  requiredUserType: UserType;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredUserType }) => {
  const { userType, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; // Don't redirect while loading initial state
    }

    if (!isAuthenticated) {
      // If not authenticated, redirect to login
      router.replace('/login');
    } else if (userType !== requiredUserType) {
      // If authenticated but wrong user type, redirect based on actual type
      const redirectPath = userType === 'KVK' ? '/kvk/announcements' : '/farmer/dashboard';
       // Prevent infinite redirect loop if already on the correct page or login
      if (pathname !== redirectPath && pathname !== '/login') {
         router.replace(redirectPath);
      }
    }
  }, [isAuthenticated, userType, requiredUserType, router, isLoading, pathname]);

  if (isLoading || !isAuthenticated || userType !== requiredUserType) {
    // Show a loading skeleton or null while checking auth/redirecting
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

  // If authenticated and correct user type, render children
  return <>{children}</>;
};

export default AuthGuard;
