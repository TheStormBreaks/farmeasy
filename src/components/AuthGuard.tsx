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
  const farmeasyLoginPath = '/farmeasy/login';
  const farmeasyKvkDefaultPath = '/farmeasy/kvk/announcements';
  const farmeasyFarmerDefaultPath = '/farmeasy/farmer/dashboard';
  const farmeasySupplyDefaultPath = '/farmeasy/supply/products';


  useEffect(() => {
    // Only apply auth guard logic if within the /farmeasy path
    if (!pathname.startsWith('/farmeasy')) {
        // If outside /farmeasy, and not loading, no specific guard needed from this component
        // The page itself or its layout should handle if it needs auth
        return;
    }

    if (isLoading) {
      return; 
    }

    if (!isAuthenticated) {
       if (pathname !== farmeasyLoginPath) {
          router.replace(farmeasyLoginPath);
       }
       return; 
    }

    const isAuthorized = requiredTypes.some(type => type === userType);

    if (!isAuthorized) {
        let redirectPath = farmeasyLoginPath; 
        if (userType === 'KVK') redirectPath = farmeasyKvkDefaultPath;
        else if (userType === 'FARMER') redirectPath = farmeasyFarmerDefaultPath;
        else if (userType === 'SUPPLY') redirectPath = farmeasySupplyDefaultPath;

        if (pathname !== redirectPath && pathname !== farmeasyLoginPath) {
           router.replace(redirectPath);
        }
    }

  }, [isAuthenticated, userType, requiredTypes, router, isLoading, pathname, farmeasyLoginPath, farmeasyKvkDefaultPath, farmeasyFarmerDefaultPath, farmeasySupplyDefaultPath]);


  // Only apply skeleton or block rendering if inside /farmeasy path
  if (pathname.startsWith('/farmeasy')) {
    const isAuthorized = requiredTypes.some(type => type === userType);
    if (isLoading || !isAuthenticated || !isAuthorized) {
       if (pathname === farmeasyLoginPath && !isAuthenticated && !isLoading) {
           return <>{children}</>; 
       }

       if(pathname !== farmeasyLoginPath) {
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
  }
  
  return <>{children}</>;
};

export default AuthGuard;
