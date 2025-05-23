
// src/app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Wheat, LogIn } from 'lucide-react'; // Added LogIn icon
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button'; // Import Button
import { useLanguage } from '@/context/LanguageContext';
import type { LanguageCode, UserType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card'; // Import Card for better styling

export default function LoginPage() {
  const { language, setLanguage, t } = useLanguage();
  const { login, userType: authenticatedUserType, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserType | ''>(''); // State to hold selected role

  const handleLanguageChange = (value: string) => {
    const newLang = value as LanguageCode;
    setLanguage(newLang);
  };

  const handleRoleSelect = (value: string) => {
    setSelectedRole(value as UserType);
  };

  const getTranslatedRoleName = (role: UserType | ''): string => {
    if (role === 'FARMER') return t('LoginPage.roleFarmer');
    if (role === 'KVK') return t('LoginPage.roleKVKOfficial');
    if (role === 'SUPPLY') return t('LoginPage.roleSupplier');
    return '';
  }

  const handleQuickLogin = () => {
    if (!selectedRole) return;

    let userTypeToLogin: UserType = null;
    let redirectPath = '';

    if (selectedRole === 'KVK') {
      userTypeToLogin = 'KVK';
      redirectPath = '/kvk/announcements';
    } else if (selectedRole === 'FARMER') {
      userTypeToLogin = 'FARMER';
      redirectPath = '/farmer/dashboard';
    } else if (selectedRole === 'SUPPLY') {
      userTypeToLogin = 'SUPPLY';
      redirectPath = '/supply/products';
    }


    if (userTypeToLogin) {
      login(userTypeToLogin);
      // AuthContext useEffect might handle redirect, but explicit redirect is fine for prototype
      router.replace(redirectPath);
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!authIsLoading && authenticatedUserType) {
      if (authenticatedUserType === 'KVK') {
        router.replace('/kvk/announcements');
      } else if (authenticatedUserType === 'FARMER') {
        router.replace('/farmer/dashboard');
      } else if (authenticatedUserType === 'SUPPLY') {
        router.replace('/supply/products');
      }
    }
  }, [authenticatedUserType, authIsLoading, router]);


  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <Card className="w-full max-w-md space-y-8 p-8 shadow-2xl rounded-xl">
        <div className="text-center">
          <Wheat className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-6 text-3xl font-extrabold text-foreground">
            {t('LoginPage.mainTitle')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('LoginPage.subTitle')}
          </p>
        </div>

        {/* Language Selector */}
        <div className="space-y-4">
          <div className='flex flex-col space-y-1.5 items-start'>
            <Label htmlFor="language-select" className="text-sm font-medium text-foreground">
              {t('LoginPage.languageLabel')}
            </Label>
            <Select
              value={language}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger id="language-select" className="w-full">
                <SelectValue placeholder={t('LoginPage.languageLabel')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                <SelectItem value="ma">मैथिली (Maithili)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Login Dropdown */}
        <div className="space-y-4 pt-4">
          <div className='flex flex-col space-y-1.5 items-start'>
            <Label htmlFor="quick-login-select" className="text-sm font-medium text-foreground">
              {t('LoginPage.prototypeSelectRoleLabel')}
            </Label>
            <Select onValueChange={handleRoleSelect} value={selectedRole || undefined}>
              <SelectTrigger id="quick-login-select" className="w-full">
                <SelectValue placeholder={t('LoginPage.prototypeSelectRolePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FARMER">{t('LoginPage.roleFarmer')}</SelectItem>
                <SelectItem value="KVK">{t('LoginPage.roleKVKOfficial')}</SelectItem>
                <SelectItem value="SUPPLY">{t('LoginPage.roleSupplier')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {t('LoginPage.prototypeDescription')}
            </p>
          </div>
        </div>

        {/* Login Button - appears after role is selected */}
        {selectedRole && (
          <div className="pt-4">
            <Button onClick={handleQuickLogin} className="w-full" disabled={authIsLoading}>
              <LogIn className="mr-2 h-4 w-4" />
              {t('LoginPage.loginAsButtonPrefix')}{getTranslatedRoleName(selectedRole)}
            </Button>
          </div>
        )}
      </Card>
    </main>
  );
}
