// src/app/supply/products/page.tsx
import type { Metadata } from 'next';
import ProductManagement from '@/components/ProductManagement'; // Create this component
import { PackagePlus } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Manage Products | Supplier Portal',
    description: 'Add, update, or remove products available for sale.',
};

export default function SupplyProductsPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center mb-6">
                 <PackagePlus className="h-8 w-8 mr-3 text-primary" />
                 <h1 className="text-3xl font-bold text-foreground">Product Management</h1>
            </div>
             <p className="mb-6 text-muted-foreground">
               Add new products or manage existing inventory.
             </p>
            <ProductManagement />
        </div>
    );
}
