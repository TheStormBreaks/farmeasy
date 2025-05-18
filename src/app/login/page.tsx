// src/app/login/page.tsx
'use client';

import type { Metadata } from 'next';
import { useState }
from 'react';
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

// export const metadata: Metadata = { // Metadata needs to be handled differently with client components
//   title: 'Login | FarmEasy Connect',
//   description: 'Login to FarmEasy Connect',
// };

const pageContent = {
  en: {
    mainTitle: 'FarmEasy Connect',
    subTitle: 'Login to your account',
    languageLabel: 'Language',
    loginFormTitle: 'Login', // Placeholder, form content not translated in this step
  },
  hi: {
    mainTitle: 'फार्मइजी कनेक्ट',
    subTitle: 'अपने खाते में लॉग इन करें',
    languageLabel: 'भाषा',
    loginFormTitle: 'लॉग इन करें',
  },
  kn: {
    mainTitle: 'ಫಾರ್ಮ್‌ಈಸಿ ಕನೆಕ್ಟ್',
    subTitle: 'ನಿಮ್ಮ ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ',
    languageLabel: 'ಭಾಷೆ',
    loginFormTitle: 'ಲಾಗಿನ್ ಮಾಡಿ',
  },
};

type LanguageKey = keyof typeof pageContent;

export default function LoginPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageKey>('en');

  const currentContent = pageContent[selectedLanguage];

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-secondary/30">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Wheat className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-6 text-3xl font-extrabold text-foreground">
            {currentContent.mainTitle}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {currentContent.subTitle}
          </p>
        </div>

        <div className="mx-auto max-w-sm space-y-4">
          <div className='flex flex-col space-y-1.5 items-start'>
             <Label htmlFor="language-select" className="text-sm font-medium text-foreground">
                {currentContent.languageLabel}
              </Label>
            <Select
              value={selectedLanguage}
              onValueChange={(value) => setSelectedLanguage(value as LanguageKey)}
            >
              <SelectTrigger id="language-select" className="w-full">
                <SelectValue placeholder={currentContent.languageLabel} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
