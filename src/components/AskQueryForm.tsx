// src/components/AskQueryForm.tsx
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { HelpCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useQueries } from '@/hooks/useQueries'; // Assuming useQueries hook exists

const formSchema = z.object({
  questionText: z.string().min(15, { message: 'Question must be at least 15 characters long' }).max(1000, { message: 'Question cannot exceed 1000 characters' }),
});

type QueryFormValues = z.infer<typeof formSchema>;

export default function AskQueryForm() {
  const { toast } = useToast();
  const { userId } = useAuth();
  const { addQuery } = useQueries(); // Assuming addQuery function exists in the hook
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<QueryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questionText: '',
    },
  });

   const onSubmit = async (values: QueryFormValues) => {
        if (!userId) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to ask a question.' });
            return;
        }
        setIsLoading(true);
        try {
            await addQuery(userId, values.questionText); // Pass farmerId and question
            toast({
                title: 'Success',
                description: 'Your question has been submitted successfully.',
            });
            form.reset(); // Clear the form
        } catch (error) {
            console.error("Failed to submit query:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to submit your question. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };


  return (
    <Card className="shadow-md">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="questionText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                              <HelpCircle className="h-4 w-4 mr-2"/>
                              Your Question
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your question for the KVK experts here..."
                              className="resize-none"
                              rows={7}
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
                <CardFooter>
                     <Button type="submit" disabled={isLoading} className="w-full">
                         {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Question'}
                    </Button>
                </CardFooter>
            </form>
        </Form>
    </Card>
  );
}
