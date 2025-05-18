
// src/app/login/page.tsx
'use client';

import { useState, useEffect } from 'react'; // Import useEffect
import LoginForm from '@/components/LoginForm';
import { Wheat } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext'; // Import useLanguage
import type { LanguageCode } from '@/types';

export default function LoginPage() {
  const { language, setLanguage, t } = useLanguage(); // Use the language context
  // const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(language); // Initialize with context language

  // useEffect(() => {
  //   setSelectedLanguage(language); // Sync local state if context language changes elsewhere
  // }, [language]);

  const handleLanguageChange = (value: string) => {
    const newLang = value as LanguageCode;
    // setSelectedLanguage(newLang);
    setLanguage(newLang); // Update global language context
  };

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
              </SelectContent>
            </Select>
          </div>
        </div>

        <LoginForm /> {/* LoginForm will now also use useLanguage hook */}
      </div>
    </main>
  );
}
