
// src/components/RegisterTrainingForm.tsx
'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import { useAuth } from '@/context/AuthContext';
import { useRegistrations } from '@/hooks/useRegistrations'; // Assuming hook exists
import { Loader2 } from 'lucide-react';
import type { TrainingProgram } from '@/types';

// Basic schema for registration form
const registrationFormSchema = z.object({
  farmerName: z.string().min(3, { message: 'Name must be at least 3 characters.' }).max(100),
  // Basic mobile number validation (can be enhanced)
  mobileNumber: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit mobile number.' }),
});

type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

interface RegisterTrainingFormProps {
  program: TrainingProgram;
  onClose: (success?: boolean) => void;
}

export default function RegisterTrainingForm({ program, onClose }: RegisterTrainingFormProps) {
  const { toast } = useToast();
  const { userId } = useAuth(); // Get Farmer ID
  const { addRegistration } = useRegistrations({ farmerId: userId || undefined }); // Initialize hook
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      farmerName: '',
      mobileNumber: '',
    },
  });

  const onSubmit = async (values: RegistrationFormValues) => {
    if (!userId) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to register.' });
      return;
    }
    setIsLoading(true);
    try {
      const registrationData = {
        programId: program.id,
        farmerId: userId,
        farmerName: values.farmerName,
        mobileNumber: values.mobileNumber,
      };

       const result = await addRegistration(registrationData);

        if (result === null) { // Check if already registered (hook returns null in that case)
             toast({
                 variant: 'default', // Or 'info' if you add that variant
                 title: 'Already Registered',
                 description: 'You are already registered for this training program.',
            });
        } else {
             toast({ title: 'Success', description: `Successfully registered for "${program.title}".` });
        }
       onClose(true); // Close dialog on success or if already registered

    } catch (error: any) {
      console.error("Failed to register:", error);
       toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message || 'Could not complete registration. Please try again.',
      });
       // Keep dialog open onClose(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2 pb-4 px-1">
        <FormField
          control={form.control}
          name="farmerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mobileNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Enter your 10-digit mobile number" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => onClose(false)} className="mr-2" disabled={isLoading}>
                  Cancel
              </Button>
             <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm Registration
            </Button>
        </div>
      </form>
    </Form>
  );
}
