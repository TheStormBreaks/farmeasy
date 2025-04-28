
// src/components/TrainingProgramForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms'; // Create this hook
import type { TrainingProgram } from '@/types';

// Schema for the form
const programFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }).max(150),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }).max(1000),
  date: z.date({ required_error: "Training date is required." }),
  location: z.string().min(3, { message: 'Location must be at least 3 characters.' }).max(100),
  registrationDeadline: z.date().optional(),
});

type ProgramFormValues = z.infer<typeof programFormSchema>;

interface TrainingProgramFormProps {
    programToEdit?: TrainingProgram | null;
    onClose: (success?: boolean) => void; // Callback to close the dialog/modal
}

export default function TrainingProgramForm({ programToEdit, onClose }: TrainingProgramFormProps) {
  const { toast } = useToast();
  const { userId } = useAuth(); // Get KVK user ID
  const { addProgram, updateProgram } = useTrainingPrograms();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      title: '',
      description: '',
      date: undefined,
      location: '',
      registrationDeadline: undefined,
    },
  });

  // Pre-fill form if editing
  useEffect(() => {
    if (programToEdit) {
      form.reset({
        title: programToEdit.title,
        description: programToEdit.description,
        date: new Date(programToEdit.date),
        location: programToEdit.location,
        registrationDeadline: programToEdit.registrationDeadline ? new Date(programToEdit.registrationDeadline) : undefined,
      });
    } else {
      form.reset(); // Clear form if adding new
    }
  }, [programToEdit, form]);

  const onSubmit = async (values: ProgramFormValues) => {
    if (!userId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Authentication error.' });
      return;
    }
    setIsLoading(true);
    try {
      const programData = {
        ...values,
        date: values.date.getTime(), // Convert Date to timestamp number
        registrationDeadline: values.registrationDeadline?.getTime(), // Convert optional Date
        kvkId: userId, // Add KVK ID
      };

      if (programToEdit) {
        await updateProgram(programToEdit.id, programData);
        toast({ title: 'Success', description: 'Training program updated successfully.' });
      } else {
        await addProgram(programData);
        toast({ title: 'Success', description: 'Training program created successfully.' });
      }
      onClose(true); // Close dialog on success
    } catch (error) {
      console.error("Failed to save training program:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${programToEdit ? 'update' : 'create'} training program.`,
      });
       // Keep dialog open on error onClose(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Advanced Drip Irrigation Techniques" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the training program details, objectives, and target audience..." {...field} disabled={isLoading} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Training Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0)) // Disable past dates
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

         <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., KVK Center Auditorium" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="registrationDeadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Registration Deadline (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a deadline</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                     disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0)) // Disable past dates
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
                {programToEdit ? 'Update Program' : 'Create Program'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
