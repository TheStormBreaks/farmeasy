
// src/app/farmer/training/page.tsx
'use client';
import type { Metadata } from 'next';
import ViewTrainingProgramsFarmer from '@/components/ViewTrainingProgramsFarmer';
import { GraduationCap, History } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ViewMyRegistrations from '@/components/ViewMyRegistrations';
import { useLanguage } from '@/context/LanguageContext';

// export const metadata: Metadata = {
//     title: 'Training Programs | Farmer Portal',
//     description: 'View and register for upcoming training programs offered by KVK.',
// };

export default function FarmerTrainingPage() {
    const { t } = useLanguage();

    // React.useEffect(() => {
    //   document.title = t('FarmerTrainingPage.metadata_title');
    // }, [t]);

    return (
        <div className="container mx-auto py-8 space-y-10">
            {/* Available Programs Section */}
             <div>
                 <div className="flex items-center mb-6">
                     <GraduationCap className="h-8 w-8 mr-3 text-primary" />
                     <h1 className="text-3xl font-bold text-foreground">{t('FarmerTrainingPage.available_programs_title')}</h1>
                </div>
                <p className="mb-8 text-muted-foreground">
                    {t('FarmerTrainingPage.available_programs_description')}
                </p>
                <ViewTrainingProgramsFarmer />
            </div>

            <Separator />

             {/* My Registrations Section */}
            <div>
                 <div className="flex items-center mb-6">
                    <History className="h-8 w-8 mr-3 text-secondary-foreground" />
                    <h1 className="text-3xl font-bold text-foreground">{t('FarmerTrainingPage.registered_programs_title')}</h1>
                 </div>
                 <p className="mb-8 text-muted-foreground">
                    {t('FarmerTrainingPage.registered_programs_description')}
                 </p>
                 <ViewMyRegistrations /> {/* Component to show farmer's registrations */}
             </div>
        </div>
    );
}
