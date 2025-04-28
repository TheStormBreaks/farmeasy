// src/components/ShoppingCartDisplay.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/hooks/useProducts'; // To get current stock levels
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Loader2, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function ShoppingCartDisplay() {
    const { userId } = useAuth();
    const { cart, isLoading, error, updateItemQuantity, removeItemFromCart, clearCart } = useCart(userId);
    const { products, isLoading: productsLoading } = useProducts(); // Fetch all products to check stock
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState<string | null>(null); // Track which item quantity is being updated
    const [isClearing, setIsClearing] = useState(false);

     // Create a map for easy product lookup by ID
     const productMap = useMemo(() => {
        const map = new Map<string, { availableQuantity: number; price: number; name: string }>();
        products.forEach(p => map.set(p.id, { availableQuantity: p.availableQuantity, price: p.price, name: p.name }));
        return map;
    }, [products]);


    const handleQuantityChange = async (productId: string, newQuantity: number) => {
         const productInfo = productMap.get(productId);
         const maxQuantity = productInfo?.availableQuantity ?? 0;

        if (newQuantity < 0) return; // Prevent negative quantity
        if (newQuantity > maxQuantity) {
             toast({
                variant: 'destructive',
                title: 'Stock Limit Reached',
                description: `Only ${maxQuantity} units of ${productInfo?.name || 'this item'} available.`,
            });
             newQuantity = maxQuantity; // Adjust to max available
        }


        setIsUpdating(productId);
        try {
             if (newQuantity === 0) {
                await removeItemFromCart(productId);
                toast({ title: 'Item Removed', description: `Removed from cart.` });
            } else {
                await updateItemQuantity(productId, newQuantity);
                // Optional: Add a success toast here if needed, but might be too noisy
            }
        } catch (err) {
            console.error("Failed to update cart quantity:", err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update quantity.' });
        } finally {
            setIsUpdating(null);
        }
    };


     const handleClearCart = async () => {
        setIsClearing(true);
         try {
            await clearCart();
            // Toast is handled within useCart hook now
         } catch (err) {
            // Error toast handled within useCart hook now
            console.error("Error in clearCart component handler:", err);
         } finally {
            setIsClearing(false);
         }
     }

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => {
            const productInfo = productMap.get(item.productId);
            const price = productInfo?.price ?? item.productDetails?.price ?? 0; // Use map price first, fallback to stored details
            return total + price * item.quantity;
        }, 0);
    };

    const renderSkeleton = () => (
        <TableRow>
            <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
            <TableCell className="text-center"><Skeleton className="h-8 w-20 inline-block" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-8 inline-block" /></TableCell>
        </TableRow>
    );

    if (isLoading || productsLoading) {
         return (
             <Card className="shadow-lg">
                 <CardHeader>
                     <Skeleton className="h-6 w-1/2" />
                     <Skeleton className="h-4 w-3/4 mt-1" />
                 </CardHeader>
                 <CardContent>
                     <Table>
                         <TableHeader>
                             <TableRow>
                                 <TableHead>Product</TableHead>
                                 <TableHead className="text-center">Quantity</TableHead>
                                 <TableHead className="text-right">Unit Price</TableHead>
                                 <TableHead className="text-right">Subtotal</TableHead>
                                 <TableHead className="text-right">Remove</TableHead>
                             </TableRow>
                         </TableHeader>
                         <TableBody>
                             {renderSkeleton()}
                             {renderSkeleton()}
                         </TableBody>
                         <TableFooter>
                             <TableRow>
                                <TableCell colSpan={4} className="text-right font-bold text-lg">Total:</TableCell>
                                <TableCell className="text-right font-bold text-lg"><Skeleton className="h-6 w-24" /></TableCell>
                             </TableRow>
                        </TableFooter>
                     </Table>
                 </CardContent>
                 <CardFooter className="flex justify-end">
                     <Skeleton className="h-10 w-32" />
                 </CardFooter>
             </Card>
         );
    }

     if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Cart</AlertTitle>
                <AlertDescription>
                    Failed to load your shopping cart: {error.message}. Please try refreshing.
                </AlertDescription>
            </Alert>
        );
    }

     if (!cart || cart.items.length === 0) {
        return (
            <Card className="shadow-md text-center">
                <CardHeader>
                    <CardTitle>Your Cart is Empty</CardTitle>
                     <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground my-4" />
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">Looks like you haven't added any products yet.</p>
                     <Button asChild>
                        <Link href="/farmer/shop">Start Shopping</Link>
                     </Button>
                </CardContent>
            </Card>
        );
    }


    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Cart Summary</CardTitle>
                <CardDescription>Review and modify your items.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-center w-36">Quantity</TableHead>
                            <TableHead className="text-right w-24">Unit Price</TableHead>
                            <TableHead className="text-right w-28">Subtotal</TableHead>
                            <TableHead className="text-right w-16">Remove</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cart.items.map((item) => {
                            const productInfo = productMap.get(item.productId);
                             const price = productInfo?.price ?? item.productDetails?.price ?? 0;
                             const name = productInfo?.name ?? item.productDetails?.name ?? 'Product not found';
                             const maxQuantity = productInfo?.availableQuantity ?? item.quantity; // Use current quantity if product info missing (conservative)
                             const subtotal = price * item.quantity;
                             const isUpdatingThis = isUpdating === item.productId;
                             const quantityExceedsStock = item.quantity > maxQuantity;

                            return (
                                <TableRow key={item.productId}>
                                    <TableCell className="font-medium">
                                        {name}
                                        {quantityExceedsStock && (
                                             <p className="text-xs text-destructive mt-1">
                                                 Max available: {maxQuantity}. Please adjust quantity.
                                             </p>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                         <div className="flex items-center justify-center border rounded-md w-32 mx-auto">
                                             <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                 disabled={item.quantity <= 0 || isUpdatingThis}
                                            >
                                                 {isUpdatingThis ? <Loader2 className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4" />}
                                            </Button>
                                             <Input
                                                type="number"
                                                className={`h-8 w-12 text-center border-l border-r rounded-none focus-visible:ring-0 ${quantityExceedsStock ? 'border-destructive ring-destructive focus-visible:ring-destructive' : ''}`}
                                                value={item.quantity}
                                                 onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value, 10) || 0)} // Handle NaN
                                                min="0"
                                                 max={maxQuantity} // Visually indicate max, logic handles enforcement
                                                 disabled={isUpdatingThis}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                 disabled={item.quantity >= maxQuantity || isUpdatingThis}
                                            >
                                                 {isUpdatingThis ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                            </Button>
                                         </div>
                                    </TableCell>
                                    <TableCell className="text-right">${price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">${subtotal.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleQuantityChange(item.productId, 0)} // Set quantity to 0 to remove
                                            disabled={isUpdating === item.productId}
                                            aria-label="Remove item"
                                            className="text-destructive hover:text-destructive/80"
                                        >
                                             {isUpdating === item.productId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                         })}
                    </TableBody>
                     <TableFooter>
                        <TableRow>
                             <TableCell colSpan={3} className="text-right font-bold text-lg">Total:</TableCell>
                             <TableCell className="text-right font-bold text-lg">${calculateTotal().toFixed(2)}</TableCell>
                             <TableCell>
                                 <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={handleClearCart}
                                     disabled={isClearing || isLoading}
                                     className="w-full"
                                     aria-label="Clear entire cart"
                                 >
                                      {isClearing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1 h-4 w-4" />}
                                     Clear Cart
                                 </Button>
                             </TableCell>
                        </TableRow>
                     </TableFooter>
                </Table>
            </CardContent>
             <CardFooter className="flex justify-end">
                {/* Add Checkout Button later if needed */}
                 <Button disabled>Proceed to Checkout (Not Implemented)</Button>
            </CardFooter>
        </Card>
    );
}
