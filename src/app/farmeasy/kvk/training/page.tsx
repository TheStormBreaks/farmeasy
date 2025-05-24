
// src/app/kvk/training/page.tsx
'use client';
import type { Metadata } from 'next';
import ManageTrainingPrograms from '@/components/ManageTrainingPrograms'; 
import { GraduationCap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// export const metadata: Metadata = {
//     title: 'Manage Training Programs | KVK Portal',
//     description: 'Create, view, and manage training programs and registrations.',
// };

export default function KVKTrainingPage() {
    const { t } = useLanguage();

    // React.useEffect(() => {
    //   document.title = t('KVKTrainingPage.metadata_title');
    // }, [t]);
    
    return (
        <div className="container mx-auto py-8">
             <div className="flex items-center mb-6">
                <GraduationCap className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">{t('KVKTrainingPage.page_title')}</h1>
            </div>
            <p className="mb-8 text-muted-foreground">
               {t('KVKTrainingPage.page_description')}
            </p>
            <ManageTrainingPrograms />
        </div>
    );
}
