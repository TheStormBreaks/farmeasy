import type { Metadata } from 'next';
import LoginForm from '@/components/LoginForm';
import { Wheat } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Login | FarmEasy Connect',
  description: 'Login to FarmEasy Connect',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-secondary/30">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
           <Wheat className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-6 text-3xl font-extrabold text-foreground">
            FarmEasy Connect
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Login to your account
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
