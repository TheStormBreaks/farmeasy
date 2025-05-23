// src/app/supply/layout.tsx
import type { ReactNode } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppHeader from '@/components/AppHeader';

export default function SupplyLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredUserType="SUPPLY">
        <AppHeader userRole="SUPPLY" />
        <main className="p-4 md:p-8 min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          {children}
        </main>
    </AuthGuard>
  );
}
