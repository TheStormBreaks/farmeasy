
// src/components/CropWeatherAdvisory.tsx
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, CloudSun, Loader2, Save } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/LanguageContext'; // Import useLanguage

const ADVISORY_DOC_ID = 'current_advisory'; // Fixed ID for the single advisory document
const ADVISORY_COLLECTION = 'advisories'; // Collection to store the advisory

const formSchema = z.object({
  advisoryText: z.string().min(20, { message: 'Advisory must be at least 20 characters long' }).max(2000, { message: 'Advisory cannot exceed 2000 characters' }),
});

type AdvisoryFormValues = z.infer<typeof formSchema>;

export default function CropWeatherAdvisory() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [currentAdvisory, setCurrentAdvisory] = useState('');
  const { t } = useLanguage(); // Use language context

  const form = useForm<AdvisoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      advisoryText: '',
    },
  });

  // Fetch current advisory on mount
  useEffect(() => {
    const fetchAdvisory = async () => {
      setIsFetching(true);
      try {
        const advisoryDocRef = doc(db, ADVISORY_COLLECTION, ADVISORY_DOC_ID);
        const docSnap = await getDoc(advisoryDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCurrentAdvisory(data.text || '');
          form.reset({ advisoryText: data.text || '' }); // Pre-fill form
        } else {
          setCurrentAdvisory(''); // No advisory set yet
          form.reset({ advisoryText: '' });
        }
      } catch (error) {
        console.error("Failed to fetch advisory:", error);
        toast({ 
            variant: 'destructive', 
            title: t('CropWeatherAdvisoryForm.errorTitle'), 
            description: t('CropWeatherAdvisoryForm.errorDescriptionLoad')
        });
      } finally {
        setIsFetching(false);
      }
    };
    fetchAdvisory();
  }, [form, toast, t]); // Added t to dependency array

  const onSubmit = async (values: AdvisoryFormValues) => {
    setIsLoading(true);
    try {
      const advisoryDocRef = doc(db, ADVISORY_COLLECTION, ADVISORY_DOC_ID);
      await setDoc(advisoryDocRef, {
        text: values.advisoryText,
        lastUpdated: serverTimestamp(),
      });
      setCurrentAdvisory(values.advisoryText); // Update local state
      toast({
        title: t('CropWeatherAdvisoryForm.successTitle'),
        description: t('CropWeatherAdvisoryForm.successDescription'),
      });
    } catch (error) {
      console.error("Failed to update advisory:", error);
      toast({
        variant: 'destructive',
        title: t('CropWeatherAdvisoryForm.errorTitle'),
        description: t('CropWeatherAdvisoryForm.errorDescriptionGeneral'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
            {t('CropWeatherAdvisoryForm.updateAdvisoryTitle')}
        </CardTitle>
        <CardDescription>
            {t('CropWeatherAdvisoryForm.advisoryDescription')}
        </CardDescription>
      </CardHeader>
      {isFetching ? (
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-1/4 mb-2" />
            <Skeleton className="h-32 w-full" />
            <CardFooter className="mt-4">
                <Skeleton className="h-10 w-full" />
            </CardFooter>
          </CardContent>
      ) : (
          <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="pt-2"> {/* Reduced top padding */}
                      <FormField
                          control={form.control}
                          name="advisoryText"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel className="flex items-center">
                                  <CloudSun className="h-4 w-4 mr-2"/>
                                  {t('CropWeatherAdvisoryForm.advisoryDetailsLabel')}
                              </FormLabel>
                              <FormControl>
                              <Textarea
                                  placeholder={t('CropWeatherAdvisoryForm.placeholderText')}
                                  className="resize-none bg-background"
                                  rows={8}
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
                          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('CropWeatherAdvisoryForm.updateButtonLoading')}</> : <> <Save className="mr-2 h-4 w-4" /> {t('CropWeatherAdvisoryForm.updateButton')}</>}
                      </Button>
                  </CardFooter>
              </form>
          </Form>
       )}
    </Card>
  );
}
