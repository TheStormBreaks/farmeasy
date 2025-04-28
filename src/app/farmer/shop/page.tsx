// src/app/farmer/shop/page.tsx
import type { Metadata } from 'next';
import ProductList from '@/components/ProductList'; // Create this component
import { ShoppingBag } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Shop Products | Farmer Portal',
    description: 'Browse and purchase products from suppliers.',
};

export default function FarmerShopPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center mb-6">
                <ShoppingBag className="h-8 w-8 mr-3 text-primary" />
                 <h1 className="text-3xl font-bold text-foreground">Available Products</h1>
            </div>
            <p className="mb-6 text-muted-foreground">
                Find the supplies you need for your farm. Add items to your cart.
             </p>
             <ProductList />
        </div>
    );
}
