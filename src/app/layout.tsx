
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from '@/context/AuthContext';
import Providers from './providers'; // Import the QueryClientProvider component
import { ThemeProvider } from '@/components/ThemeProvider'; // Import ThemeProvider
import LanguageProvider from '@/context/LanguageContext'; // Import LanguageProvider

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'FarmEasy Connect',
  description: 'Connecting KVK and Farmers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <AuthProvider>
              <LanguageProvider> {/* Wrap with LanguageProvider */}
                {children}
                <Toaster />
              </LanguageProvider>
            </AuthProvider>
          </Providers>
         </ThemeProvider>
      </body>
    </html>
  );
}
