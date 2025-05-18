
// src/components/LoginForm.tsx
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Added CardHeader, CardTitle
import { useAuth } from '@/context/AuthContext';
import type { UserType } from '@/types';
import { useLanguage } from '@/context/LanguageContext'; // Import useLanguage

const formSchema = z.object({
  userId: z.string().min(1, { message: 'User ID is required' }), // Message will be overridden by translations if key exists
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const { t } = useLanguage(); // Use language context

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
      password: '',
    },
    // Update messages based on language if needed, though dynamic messages in Zod are complex.
    // For simplicity, generic messages are kept, or rely on FormMessage component to use `t` if customized.
  });

  const onSubmit = (values: LoginFormValues) => {
    setIsLoading(true);
    const { userId, password } = values;

    let userType: UserType = null;
    let redirectPath = '';

    if (userId === 'KVK' && password === 'KVK') {
      userType = 'KVK';
      redirectPath = '/kvk/announcements';
    } else if (userId === 'FARMER' && password === 'FARMER') {
      userType = 'FARMER';
      redirectPath = '/farmer/dashboard';
    } else if (userId === 'SUPPLY' && password === 'SUPPLY') {
        userType = 'SUPPLY';
        redirectPath = '/supply/products';
    }

    if (userType) {
      login(userType);
      toast({
        title: t('LoginForm.title'), // Example of using t for toast
        description: `Welcome, ${userType}!`, // This part would need more complex translation if userType name is to be translated
      });
      router.replace(redirectPath);
    } else {
      toast({
        variant: 'destructive',
        title: t('LoginForm.title'),
        description: 'Invalid User ID or Password.', // Needs translation key if this message is to be translated
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      {/* Optional: Add a CardHeader with a translated title if desired */}
      {/* <CardHeader>
        <CardTitle>{t('LoginForm.title')}</CardTitle>
      </CardHeader> */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('LoginForm.userIdLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('LoginForm.userIdPlaceholder')} {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('LoginForm.passwordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={t('LoginForm.passwordPlaceholder')} {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('LoginForm.loggingInButton') : t('LoginForm.loginButton')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
