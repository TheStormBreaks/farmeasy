'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Wheat } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserType } from '@/types';

interface AppHeaderProps {
    userRole: UserType;
}

const AppHeader: React.FC<AppHeaderProps> = ({ userRole }) => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  const getTitle = () => {
    switch(userRole) {
        case 'KVK': return 'KVK Portal';
        case 'FARMER': return 'Farmer Dashboard';
        default: return 'FarmEasy Connect';
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Wheat className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold">{getTitle()}</span>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
