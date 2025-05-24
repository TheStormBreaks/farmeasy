// src/app/farmeasy/layout.tsx
import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from '@/context/AuthContext';
import Providers from '@/app/providers'; // QueryClientProvider component
import { ThemeProvider } from '@/components/ThemeProvider';
import LanguageProvider from '@/context/LanguageContext';
import '@/app/globals.css'; // Ensure globals are still applied if needed here specifically or rely on root

// Metadata for FarmEasy section could be dynamic based on child pages or static here
// export const metadata = { title: 'FarmEasy Connect App' };

export default function FarmEasyAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    // ThemeProvider might be at the root, or you can have a nested one
    // For simplicity, assuming it's fine to re-apply or that it inherits.
    // However, typically contexts like AuthProvider, LanguageProvider are specific to this app section.
    <ThemeProvider
      attribute="class"
      defaultTheme="system" // Or FarmEasy's specific default
      enableSystem
      disableTransitionOnChange
    >
      <Providers> {/* React Query Client Provider */}
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </Providers>
    </ThemeProvider>
  );
}
