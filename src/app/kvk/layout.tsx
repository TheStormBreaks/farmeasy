import type { ReactNode } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppHeader from '@/components/AppHeader';

export default function KVKLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredUserType="KVK">
        <AppHeader userRole="KVK" />
        <main className="p-4 md:p-8">
          {children}
        </main>
    </AuthGuard>
  );
}
