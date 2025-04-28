// src/app/farmer/cart/page.tsx
import type { Metadata } from 'next';
import ShoppingCartDisplay from '@/components/ShoppingCartDisplay'; // Create this component
import { ShoppingCart } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Shopping Cart | Farmer Portal',
    description: 'Review items in your shopping cart.',
};

export default function FarmerCartPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center mb-6">
                 <ShoppingCart className="h-8 w-8 mr-3 text-primary" />
                 <h1 className="text-3xl font-bold text-foreground">Your Shopping Cart</h1>
            </div>
             <p className="mb-6 text-muted-foreground">
                Review your selected items before proceeding (checkout not implemented).
             </p>
            <ShoppingCartDisplay />
        </div>
    );
}
