
// src/app/kvk/queries/page.tsx
'use client';
import type { Metadata } from 'next';
import ViewQueries from '@/components/ViewQueries'; 
import { ClipboardList } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// export const metadata: Metadata = {
//     title: 'Farmer Queries | KVK Portal',
//     description: 'View and manage questions submitted by farmers.',
// };

export default function KVKQueriesPage() {
    const { t } = useLanguage();

    // React.useEffect(() => {
    //   document.title = t('KVKQueriesPage.metadata_title');
    // }, [t]);

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center mb-6">
                <ClipboardList className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">{t('KVKQueriesPage.page_title')}</h1>
             </div>
             <p className="mb-6 text-muted-foreground">
                {t('KVKQueriesPage.page_description')}
             </p>
             <ViewQueries />
        </div>
    );
}
