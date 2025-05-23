
// src/app/farmer/dashboard/page.tsx
'use client'; 

import type { Metadata } from 'next';
import ExistingAnnouncements from '@/components/ExistingAnnouncements';
import DisplayAdvisory from '@/components/DisplayAdvisory'; // This now handles KVK and PDF advisories
import { Separator } from '@/components/ui/separator';
import { Megaphone, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function FarmerDashboardPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto py-8 space-y-10">
      {/* Advisory Section - Now includes both KVK manual and external PDF links */}
      <div>
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-8 w-8 mr-3 text-destructive" /> 
            <h1 className="text-3xl font-bold text-foreground">{t('FarmerDashboardPage.advisoryTitle')}</h1> 
          </div>
           <p className="mb-6 text-muted-foreground">
            Important updates regarding crop management and weather conditions. Includes advisories from KVK and external bulletins scraped from official KVK websites.
           </p>
          <DisplayAdvisory />
      </div>

      <Separator />

      {/* Announcements Section */}
      <div>
          <div className="flex items-center mb-3"> 
            <Megaphone className="h-8 w-8 mr-3 text-primary" /> 
            <h1 className="text-3xl font-bold text-foreground">{t('FarmerDashboardPage.announcementsTitle')}</h1> 
          </div>
          <p className="mb-6 text-muted-foreground">
            {t('FarmerDashboardPage.announcementsDescription')}
          </p>
          <ExistingAnnouncements />
       </div>
    </div>
  );
}
