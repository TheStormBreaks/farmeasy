
// src/app/farmer/shop/page.tsx
'use client';
import type { Metadata } from 'next';
import ProductList from '@/components/ProductList'; 
import { ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// export const metadata: Metadata = {
//     title: 'Shop Products | Farmer Portal',
//     description: 'Browse and purchase products from suppliers.',
// };

export default function FarmerShopPage() {
    const { t } = useLanguage();

    // React.useEffect(() => {
    //   document.title = t('FarmerShopPage.metadata_title');
    // }, [t]);
    
    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center mb-6">
                <ShoppingBag className="h-8 w-8 mr-3 text-primary" />
                 <h1 className="text-3xl font-bold text-foreground">{t('FarmerShopPage.page_title')}</h1>
            </div>
            <p className="mb-6 text-muted-foreground">
                {t('FarmerShopPage.page_description')}
             </p>
             <ProductList />
        </div>
    );
}
