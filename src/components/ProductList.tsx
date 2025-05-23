
// src/components/ProductList.tsx
'use client';

import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart'; // Create this hook
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Loader2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types';

export default function ProductList() {
    const { userId } = useAuth(); // Get farmer's ID for cart
    const { products, isLoading, error } = useProducts(); // Fetch all products
    const { cart, addItemToCart, isLoading: isCartLoading, updateItemQuantity } = useCart(userId);
    const { toast } = useToast();
    const [itemQuantities, setItemQuantities] = useState<{ [productId: string]: number }>({});
    const [isAdding, setIsAdding] = useState<string | null>(null); // Track which item is being added/updated

    // Initialize quantities from cart when cart loads
    React.useEffect(() => {
        if (cart && cart.items) {
            const initialQuantities: { [productId: string]: number } = {};
            cart.items.forEach(item => {
                initialQuantities[item.productId] = item.quantity;
            });
            setItemQuantities(initialQuantities);
        }
    }, [cart]);

    const handleQuantityChange = (productId: string, change: number, maxQuantity: number) => {
        setItemQuantities(prev => {
            const currentQuantity = prev[productId] || 0;
            const newQuantity = Math.max(0, Math.min(currentQuantity + change, maxQuantity)); // Ensure non-negative and within stock
             // Automatically update cart if quantity > 0 and item exists in cart
             if (newQuantity > 0) {
                 const cartItem = cart?.items.find(item => item.productId === productId);
                 if (cartItem) {
                     handleAddToCart(productId, newQuantity, maxQuantity);
                 }
             } else {
                 // If quantity becomes 0, consider removing from cart (optional, handled by Add button logic for now)
             }
            return { ...prev, [productId]: newQuantity };
        });
    };

    const handleDirectQuantityInput = (productId: string, value: string, maxQuantity: number) => {
        const quantity = parseInt(value, 10);
         if (!isNaN(quantity)) {
             const newQuantity = Math.max(0, Math.min(quantity, maxQuantity));
              setItemQuantities(prev => ({ ...prev, [productId]: newQuantity }));
               // Automatically update cart if quantity > 0 and item exists in cart
             if (newQuantity > 0) {
                 const cartItem = cart?.items.find(item => item.productId === productId);
                 if (cartItem) {
                     handleAddToCart(productId, newQuantity, maxQuantity);
                 }
             }
         } else if (value === '') {
              setItemQuantities(prev => ({ ...prev, [productId]: 0 }));
         }
    };


     const handleAddToCart = async (productId: string, quantity: number, maxQuantity: number) => {
        if (!userId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please log in to manage your cart.' });
            return;
        }
        if (quantity <= 0) {
             toast({ variant: 'destructive', title: 'Error', description: 'Quantity must be greater than zero.' });
            return;
        }
         if (quantity > maxQuantity) {
            toast({ variant: 'destructive', title: 'Error', description: `Only ${maxQuantity} items available.` });
             setItemQuantities(prev => ({...prev, [productId]: maxQuantity})); // Reset to max available
            return;
        }

        setIsAdding(productId);
        try {
            const product = products.find(p => p.id === productId);
            if (!product) throw new Error("Product not found");

             const cartItem = cart?.items.find(item => item.productId === productId);

            if (cartItem) {
                // Update quantity if item already in cart
                await updateItemQuantity(productId, quantity);
                 toast({ title: 'Cart Updated', description: `${product.name} quantity updated to ${quantity}.` });
            } else {
                // Add new item to cart
                await addItemToCart(productId, quantity, {
                     name: product.name,
                     price: product.price,
                     description: product.description, // Include description
                 });
                 toast({ title: 'Item Added', description: `${quantity} x ${product.name} added to cart.` });
            }

        } catch (err) {
            console.error("Failed to update cart:", err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update cart. Please try again.' });
        } finally {
            setIsAdding(null);
        }
    };

    const renderSkeleton = () => (
        <Card className="shadow-sm">
            <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-1" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <Skeleton className="h-8 w-1/4" />
                 <Skeleton className="h-10 w-2/5" />
            </CardFooter>
        </Card>
    );

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderSkeleton()}
                {renderSkeleton()}
                {renderSkeleton()}
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Products</AlertTitle>
                <AlertDescription>
                    Failed to load products: {error.message}. Please try refreshing the page.
                </AlertDescription>
            </Alert>
        );
    }

     if (!isLoading && products.length === 0) {
        return (
             <Card className="shadow-md col-span-full">
                <CardHeader>
                    <CardTitle>No Products Available</CardTitle>
                    <CardDescription>There are currently no products listed for sale.</CardDescription>
                </CardHeader>
                 <CardContent>
                     <p className="text-sm text-muted-foreground">Check back later for available products.</p>
                 </CardContent>
             </Card>
        );
    }


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products
                .filter(product => product.availableQuantity > 0) // Only show products with available quantity
                .map((product) => {
                 const currentQuantity = itemQuantities[product.id] || 0;
                 const isInCart = cart?.items.some(item => item.productId === product.id) ?? false;
                 const isUpdatingThisItem = isAdding === product.id || (isCartLoading && cart?.items.some(item => item.productId === product.id));

                return (
                    <Card key={product.id} className="shadow-md flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle>{product.name}</CardTitle>
                            <CardDescription>₹{product.price.toFixed(2)} per unit</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                            <p className="text-xs font-semibold text-primary">
                                {product.availableQuantity} available
                            </p>
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2">
                             {/* Quantity Selector */}
                            <div className="flex items-center border rounded-md">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                     onClick={() => handleQuantityChange(product.id, -1, product.availableQuantity)}
                                     disabled={currentQuantity <= 0 || isUpdatingThisItem}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                    type="number"
                                    className="h-8 w-12 text-center border-l border-r rounded-none focus-visible:ring-0"
                                     value={currentQuantity}
                                     onChange={(e) => handleDirectQuantityInput(product.id, e.target.value, product.availableQuantity)}
                                     min="0"
                                     max={product.availableQuantity}
                                     disabled={isUpdatingThisItem}
                                />
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                     onClick={() => handleQuantityChange(product.id, 1, product.availableQuantity)}
                                     disabled={currentQuantity >= product.availableQuantity || isUpdatingThisItem}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                             {/* Add/Update Cart Button */}
                            <Button
                                 onClick={() => handleAddToCart(product.id, currentQuantity, product.availableQuantity)}
                                 disabled={currentQuantity <= 0 || isUpdatingThisItem}
                                 className="w-full sm:w-auto"
                            >
                                {isUpdatingThisItem ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                     <ShoppingCart className="mr-2 h-4 w-4" />
                                )}
                                 {isInCart && currentQuantity > 0 ? 'Update Cart' : 'Add to Cart'}
                            </Button>
                        </CardFooter>
                    </Card>
                 );
            })}
        </div>
    );
}
