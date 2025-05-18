
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
import { Megaphone } from 'lucide-react';
import type { Announcement } from '@/types';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useLanguage } from '@/context/LanguageContext'; // Import useLanguage

const formSchema = z.object({
  announcementText: z.string().min(10, { message: 'Announcement must be at least 10 characters long' }).max(500, { message: 'Announcement cannot exceed 500 characters' }),
});

type AnnouncementFormValues = z.infer<typeof formSchema>;

export default function AnnouncementForm() {
  const { toast } = useToast();
  const { addAnnouncement, refreshAnnouncements } = useAnnouncements(); // Get refreshAnnouncements
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage(); // Use language context

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      announcementText: '',
    },
  });

   const onSubmit = async (values: AnnouncementFormValues) => {
        setIsLoading(true);
        try {
            await addAnnouncement(values.announcementText); // Call the hook function
            toast({
                title: t('AnnouncementForm.successTitle'),
                description: t('AnnouncementForm.successDescription'),
            });
            form.reset(); // Clear the form
            refreshAnnouncements(); // Explicitly refresh the announcements list
        } catch (error) {
            console.error("Failed to post announcement:", error);
            toast({
                variant: 'destructive',
                title: t('AnnouncementForm.errorTitle'),
                description: t('AnnouncementForm.errorDescription'),
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
                      name="announcementText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                              <Megaphone className="h-4 w-4 mr-2"/>
                              {t('AnnouncementForm.announcementDetailsLabel')}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('AnnouncementForm.placeholderText')}
                              className="resize-none"
                              rows={5}
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
                        {isLoading ? t('AnnouncementForm.postButtonLoading') : t('AnnouncementForm.postButton')}
                    </Button>
                </CardFooter>
            </form>
        </Form>
    </Card>
  );
}
