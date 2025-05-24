
// src/app/supply/products/page.tsx
'use client'; // Required for hooks like useLanguage

import type { Metadata } from 'next';
import ProductManagement from '@/components/ProductManagement';
import { PackagePlus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext'; // Import useLanguage

// export const metadata: Metadata = {
//     title: 'Manage Products | Supplier Portal',
//     description: 'Add, update, or remove products available for sale.',
// };

export default function SupplyProductsPage() {
    const { t } = useLanguage();

    // React.useEffect(() => {
    //   document.title = t('SupplyProductsPage.metadata_title');
    // }, [t]);
    
    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center mb-6">
                 <PackagePlus className="h-8 w-8 mr-3 text-primary" />
                 <h1 className="text-3xl font-bold text-foreground">{t('SupplyProductsPage.page_title')}</h1>
            </div>
             <p className="mb-6 text-muted-foreground">
               {t('SupplyProductsPage.page_description')}
             </p>
            <ProductManagement />
        </div>
    );
}
