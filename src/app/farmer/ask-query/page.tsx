
// src/app/farmer/ask-query/page.tsx
'use client';
import type { Metadata } from 'next';
import AskQueryForm from '@/components/AskQueryForm';
import MyQueriesDisplay from '@/components/MyQueriesDisplay'; 
import { HelpCircle, History } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/context/LanguageContext';

// export const metadata: Metadata = { // Dynamic metadata needs client-side handling
//     title: 'Ask KVK & View Queries | Farmer Portal',
//     description: 'Submit your questions to KVK experts and view your past queries.',
// };

export default function AskQueryPage() {
    const { t } = useLanguage();

    // React.useEffect(() => {
    //   document.title = t('FarmerAskQueryPage.metadata_title');
    // }, [t]);

    return (
        <div className="container mx-auto py-8 space-y-10">
            {/* Ask Query Section */}
            <div>
                 <div className="flex items-center mb-6">
                    <HelpCircle className="h-8 w-8 mr-3 text-primary" />
                    <h1 className="text-3xl font-bold text-foreground">{t('FarmerAskQueryPage.ask_kvk_title')}</h1>
                 </div>
                <p className="mb-6 text-muted-foreground">
                    {t('FarmerAskQueryPage.ask_kvk_description')}
                </p>
                <div className="max-w-2xl mx-auto">
                    <AskQueryForm />
                </div>
            </div>

            <Separator />

            {/* My Queries Section */}
            <div>
                 <div className="flex items-center mb-6">
                     <History className="h-8 w-8 mr-3 text-secondary-foreground" />
                     <h1 className="text-3xl font-bold text-foreground">{t('FarmerAskQueryPage.query_history_title')}</h1>
                </div>
                 <p className="mb-6 text-muted-foreground">
                    {t('FarmerAskQueryPage.query_history_description')}
                 </p>
                <MyQueriesDisplay /> {/* Add the component to display farmer's queries */}
            </div>
        </div>
    );
}
