// src/components/AuthGuard.tsx
'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { UserType } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGuardProps {
  children: ReactNode;
  requiredUserType: UserType | UserType[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredUserType }) => {
  const { userType, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const requiredTypes = Array.isArray(requiredUserType) ? requiredUserType : [requiredUserType];

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const loginPath = '/farmeasy/login';

    if (!isAuthenticated) {
       if (pathname !== loginPath) {
          router.replace(loginPath);
       }
       return;
    }

    const isAuthorized = requiredTypes.some(type => type === userType);

    if (!isAuthorized) {
        let redirectPath = loginPath;
        if (userType === 'KVK') redirectPath = '/farmeasy/kvk/announcements';
        else if (userType === 'FARMER') redirectPath = '/farmeasy/farmer/ai-assistant';
        else if (userType === 'SUPPLY') redirectPath = '/farmeasy/supply/products';

        if (pathname !== redirectPath && pathname !== loginPath) {
           router.replace(redirectPath);
        }
    }

  }, [isAuthenticated, userType, requiredTypes, router, isLoading, pathname]);

  const isAuthorized = requiredTypes.some(type => type === userType);

  if (isLoading || !isAuthenticated || !isAuthorized) {
       const loginPath = '/farmeasy/login';
       if (pathname === loginPath && !isAuthenticated && !isLoading) {
           return <>{children}</>;
       }

       if(pathname !== loginPath) {
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
       return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
