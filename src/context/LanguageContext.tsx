
// src/context/LanguageContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import type { LanguageCode } from '@/types';

// Import translations directly
import enTranslations from '@/translations/en.json';
import hiTranslations from '@/translations/hi.json';
import knTranslations from '@/translations/kn.json';
import maTranslations from '@/translations/ma.json'; // Import Maithili translations

type Translations = typeof enTranslations; // Assume all translation files have the same structure

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  translate: (key: string, section?: string) => string;
  t: (keyPath: string) => string; // Add a shorter alias for convenience
}

const translationsMap: Record<LanguageCode, Translations> = {
  en: enTranslations,
  hi: hiTranslations,
  kn: knTranslations,
  ma: maTranslations, // Add Maithili to the map
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>('en'); // Default language

  const translate = (key: string, section?: string): string => {
    const currentTranslations = translationsMap[language];
    if (section) {
      const sectionObject = (currentTranslations as any)[section];
      if (sectionObject && typeof sectionObject === 'object' && key in sectionObject) {
        return sectionObject[key];
      }
    } else if (key in currentTranslations) {
      return (currentTranslations as any)[key];
    }
    // Fallback for nested keys like "Page.Title"
    const keys = key.split('.');
    let currentVal: any = currentTranslations;
    for (const k of keys) {
      if (currentVal && typeof currentVal === 'object' && k in currentVal) {
        currentVal = currentVal[k];
      } else {
        return key; // Key not found, return the key itself
      }
    }
    return typeof currentVal === 'string' ? currentVal : key;
  };
  
  // More convenient t function that expects a full path like "Section.key"
  const t = (keyPath: string): string => {
    const keys = keyPath.split('.');
    let currentTranslations: any = translationsMap[language];
    for (let i = 0; i < keys.length; i++) {
        if (currentTranslations && typeof currentTranslations === 'object' && keys[i] in currentTranslations) {
            currentTranslations = currentTranslations[keys[i]];
        } else {
            // console.warn(`Translation key not found: ${keyPath} for language ${language}`);
            return keyPath; // Return the key itself if not found
        }
    }
    return typeof currentTranslations === 'string' ? currentTranslations : keyPath;
  };


  const value = useMemo(() => ({ language, setLanguage, translate, t }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
