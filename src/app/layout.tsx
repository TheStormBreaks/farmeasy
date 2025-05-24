// src/app/layout.tsx (New Root Layout for CyberHertz)
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Keep global styles
import { cn } from '@/lib/utils';
import CyberHertzNavbar from '@/components/CyberHertzNavbar';
import { ThemeProvider } from '@/components/ThemeProvider'; // For CyberHertz theme

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'CyberHertz - Innovative Solutions',
  description: 'Welcome to CyberHertz',
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
          <CyberHertzNavbar />
          <main>{children}</main>
          {/* Add a global footer for CyberHertz if needed */}
        </ThemeProvider>
      </body>
    </html>
  );
}
