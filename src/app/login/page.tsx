
// src/app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
// import LoginForm from '@/components/LoginForm'; // Original login form commented out
import { Wheat } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import type { LanguageCode, UserType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { language, setLanguage, t } = useLanguage();
  const { login, userType: authenticatedUserType, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  const handleLanguageChange = (value: string) => {
    const newLang = value as LanguageCode;
    setLanguage(newLang);
  };

  const handleQuickLogin = (selectedRole: string) => {
    if (!selectedRole) return;

    let userTypeToLogin: UserType = null;
    let redirectPath = '';

    if (selectedRole === 'KVK') {
      userTypeToLogin = 'KVK';
      redirectPath = '/kvk/announcements';
    } else if (selectedRole === 'FARMER') {
      userTypeToLogin = 'FARMER';
      redirectPath = '/farmer/dashboard';
    }

    if (userTypeToLogin) {
      login(userTypeToLogin);
      // AuthContext useEffect might handle redirect, but explicit redirect is fine for prototype
      router.replace(redirectPath);
    }
  };

  // Redirect if already logged in (e.g., if user navigates back to /login)
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
    <main className="flex min-h-screen items-center justify-center p-6 bg-secondary/30">
      <div className="w-full max-w-md space-y-8">
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
        <div className="mx-auto max-w-sm space-y-4">
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
        <div className="mx-auto max-w-sm space-y-4 pt-4">
          <div className='flex flex-col space-y-1.5 items-start'>
            <Label htmlFor="quick-login-select" className="text-sm font-medium text-foreground">
              Prototype: Select Role to Login
            </Label>
            <Select onValueChange={handleQuickLogin}>
              <SelectTrigger id="quick-login-select" className="w-full">
                <SelectValue placeholder="Select role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FARMER">Login as Farmer</SelectItem>
                <SelectItem value="KVK">Login as KVK</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              This is a temporary quick login for prototype demonstration.
            </p>
          </div>
        </div>

        {/* Original LoginForm - Commented out for the prototype */}
        {/* 
        <Card className="w-full max-w-md shadow-lg">
           <LoginForm />
        </Card> 
        */}
      </div>
    </main>
  );
}
