
// src/app/farmer/cart/page.tsx
'use client';
import type { Metadata } from 'next';
import ShoppingCartDisplay from '@/components/ShoppingCartDisplay';
import { ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// export const metadata: Metadata = {
//     title: 'Shopping Cart | Farmer Portal',
//     description: 'Review items in your shopping cart.',
// };

export default function FarmerCartPage() {
    const { t } = useLanguage();

    // React.useEffect(() => {
    //   document.title = t('FarmerCartPage.metadata_title');
    // }, [t]);

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center mb-6">
                 <ShoppingCart className="h-8 w-8 mr-3 text-primary" />
                 <h1 className="text-3xl font-bold text-foreground">{t('FarmerCartPage.page_title')}</h1>
            </div>
             <p className="mb-6 text-muted-foreground">
                {t('FarmerCartPage.page_description')}
             </p>
            <ShoppingCartDisplay />
        </div>
    );
}
