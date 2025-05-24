// src/components/AppHeader.tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation'; 
import Link from 'next/link'; 
import { Button } from '@/components/ui/button';
import { LogOut, Wheat, ShoppingCart, ShoppingBag, PackagePlus, HelpCircle, MessageSquareWarning, ClipboardList, GraduationCap, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserType } from '@/types';
import { cn } from '@/lib/utils';
import { useTheme } from "next-themes";
import { useLanguage } from '@/context/LanguageContext'; 

interface AppHeaderProps {
    userRole: UserType;
}

const AppHeader: React.FC<AppHeaderProps> = ({ userRole }) => {
  const { logout } = useAuth();
  const pathname = usePathname(); 
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage(); 

  const handleLogout = () => {
    logout();
  };

  const getTitle = () => {
    switch(userRole) {
        case 'KVK': return t('AppHeader.kvkPortal');
        case 'FARMER': return t('AppHeader.farmerPortal');
        case 'SUPPLY': return t('AppHeader.supplierPortal');
        default: return t('AppHeader.defaultTitle');
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const farmeasyPrefix = "/farmeasy";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Wheat className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold">{getTitle()}</span>
        </div>

        <nav className="flex flex-1 items-center space-x-4 lg:space-x-6 mx-6">
            {userRole === 'FARMER' && (
                <>
                    <Link
                        href={`${farmeasyPrefix}/farmer/dashboard`}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === `${farmeasyPrefix}/farmer/dashboard` ? "text-primary" : "text-muted-foreground"
                        )}
                        >
                        {t('AppHeader.nav.farmer_dashboard')}
                    </Link>
                     <Link
                        href={`${farmeasyPrefix}/farmer/training`}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === `${farmeasyPrefix}/farmer/training` ? "text-primary" : "text-muted-foreground"
                        )}
                        >
                         <GraduationCap className="inline-block h-4 w-4 mr-1" /> {t('AppHeader.nav.farmer_training')}
                    </Link>
                    <Link
                        href={`${farmeasyPrefix}/farmer/shop`}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === `${farmeasyPrefix}/farmer/shop` ? "text-primary" : "text-muted-foreground"
                        )}
                        >
                        <ShoppingBag className="inline-block h-4 w-4 mr-1" /> {t('AppHeader.nav.farmer_shop')}
                    </Link>
                    <Link
                        href={`${farmeasyPrefix}/farmer/cart`}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === `${farmeasyPrefix}/farmer/cart` ? "text-primary" : "text-muted-foreground"
                        )}
                        >
                         <ShoppingCart className="inline-block h-4 w-4 mr-1" /> {t('AppHeader.nav.farmer_cart')}
                    </Link>
                     <Link
                        href={`${farmeasyPrefix}/farmer/ask-query`}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === `${farmeasyPrefix}/farmer/ask-query` ? "text-primary" : "text-muted-foreground"
                        )}
                        >
                        <HelpCircle className="inline-block h-4 w-4 mr-1" /> {t('AppHeader.nav.farmer_ask_query')}
                    </Link>
                </>
            )}
             {userRole === 'KVK' && (
                <>
                    <Link
                        href={`${farmeasyPrefix}/kvk/announcements`}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === `${farmeasyPrefix}/kvk/announcements` ? "text-primary" : "text-muted-foreground"
                        )}
                        >
                         <MessageSquareWarning className="inline-block h-4 w-4 mr-1" /> {t('AppHeader.nav.kvk_announcements')}
                    </Link>
                     <Link
                        href={`${farmeasyPrefix}/kvk/training`}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === `${farmeasyPrefix}/kvk/training` ? "text-primary" : "text-muted-foreground"
                        )}
                        >
                         <GraduationCap className="inline-block h-4 w-4 mr-1" /> {t('AppHeader.nav.kvk_training')}
                    </Link>
                     <Link
                        href={`${farmeasyPrefix}/kvk/queries`}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === `${farmeasyPrefix}/kvk/queries` ? "text-primary" : "text-muted-foreground"
                        )}
                        >
                         <ClipboardList className="inline-block h-4 w-4 mr-1" /> {t('AppHeader.nav.kvk_queries')}
                    </Link>
                </>
             )}
              {userRole === 'SUPPLY' && (
                 <>
                    <Link
                        href={`${farmeasyPrefix}/supply/products`}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === `${farmeasyPrefix}/supply/products` ? "text-primary" : "text-muted-foreground"
                        )}
                        >
                         <PackagePlus className="inline-block h-4 w-4 mr-1" /> {t('AppHeader.nav.supply_products')}
                    </Link>
                 </>
              )}
        </nav>

        <div className="flex items-center justify-end space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={t('AppHeader.toggleTheme')}>
             <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
             <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
             <span className="sr-only">{t('AppHeader.toggleTheme')}</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            {t('AppHeader.logout')}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
