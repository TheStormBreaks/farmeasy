
// src/app/farmer/dashboard/page.tsx
'use client'; // Required for hooks like useLanguage

import type { Metadata } from 'next';
import ExistingAnnouncements from '@/components/ExistingAnnouncements';
import DisplayAdvisory from '@/components/DisplayAdvisory';
import { Separator } from '@/components/ui/separator';
import { Wheat, Megaphone, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext'; // Import useLanguage

// Metadata needs to be handled differently if dynamically generated based on language.
// For now, we'll keep static metadata or you can manage it via a language-aware head.
// export const metadata: Metadata = {
//   title: 'Dashboard | Farmer Portal', // This would need to be dynamic
//   description: 'View announcements and advisories from KVK.',
// };

export default function FarmerDashboardPage() {
  const { t } = useLanguage(); // Use language context

  // If you need dynamic metadata based on language:
  // React.useEffect(() => {
  // document.title = t('FarmerDashboardPage.title');
  // Consider using a library or a custom solution for managing <head> tags dynamically
  // }, [t]);


  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-7 w-7 mr-3 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">{t('FarmerDashboardPage.advisoryTitle')}</h1>
          </div>
          <DisplayAdvisory />
      </div>

      <Separator />

      <div>
          <div className="flex items-center mb-4">
            <Megaphone className="h-7 w-7 mr-3 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{t('FarmerDashboardPage.announcementsTitle')}</h1>
          </div>
          <p className="mb-6 text-muted-foreground">
            {t('FarmerDashboardPage.announcementsDescription')}
          </p>
          <ExistingAnnouncements />
       </div>
    </div>
  );
}
