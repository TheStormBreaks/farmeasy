// src/components/AppHeader.tsx
'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, Wheat, ShoppingCart, ShoppingBag, PackagePlus } from 'lucide-react'; // Added icons
import { useAuth } from '@/context/AuthContext';
import type { UserType } from '@/types';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
    userRole: UserType;
}

const AppHeader: React.FC<AppHeaderProps> = ({ userRole }) => {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
  };

  const getTitle = () => {
    switch(userRole) {
        case 'KVK': return 'KVK Portal';
        case 'FARMER': return 'Farmer Portal';
        case 'SUPPLY': return 'Supplier Portal';
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

        {/* Navigation Links based on Role */}
        <nav className="flex flex-1 items-center space-x-4 lg:space-x-6 mx-6">
            {userRole === 'FARMER' && (
                <>
                    <Link
                        href="/farmer/shop"
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === "/farmer/shop" ? "text-primary" : "text-muted-foreground"
                        )}
                        >
                        <ShoppingBag className="inline-block h-4 w-4 mr-1" /> Shop
                    </Link>
                    <Link
                        href="/farmer/cart"
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === "/farmer/cart" ? "text-primary" : "text-muted-foreground"
                        )}
                        >
                         <ShoppingCart className="inline-block h-4 w-4 mr-1" /> Cart
                    </Link>
                     <Link
                        href="/farmer/dashboard"
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === "/farmer/dashboard" ? "text-primary" : "text-muted-foreground"
                        )}
                        >
                        Announcements
                    </Link>
                </>
            )}
             {userRole === 'KVK' && (
                <>
                    <Link
                        href="/kvk/announcements"
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === "/kvk/announcements" ? "text-primary" : "text-muted-foreground"
                        )}
                        >
                        Announcements
                    </Link>
                </>
             )}
              {userRole === 'SUPPLY' && (
                 <>
                    <Link
                        href="/supply/products"
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === "/supply/products" ? "text-primary" : "text-muted-foreground"
                        )}
                        >
                         <PackagePlus className="inline-block h-4 w-4 mr-1" /> Manage Products
                    </Link>
                 </>
              )}
        </nav>

        <div className="flex items-center justify-end space-x-2">
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
