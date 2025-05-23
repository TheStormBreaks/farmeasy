
// src/components/ShoppingCartDisplay.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Script from 'next/script';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Loader2, Minus, Plus, Trash2, ShoppingCart as ShoppingCartIcon, CreditCard } from 'lucide-react'; // Renamed ShoppingCart to avoid conflict
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { Product } from '@/types';

// Define Razorpay at window level for TypeScript
declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function ShoppingCartDisplay() {
    const { userId, userType } // Assuming userType might have email/phone for prefill
     = useAuth();
    const { cart, isLoading, error, updateItemQuantity, removeItemFromCart, clearCart } = useCart(userId);
    const { products, isLoading: productsLoading, products: allProducts } = useProducts(); // Fetch all products to check stock and get UPI
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [isClearing, setIsClearing] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);


    const productMap = useMemo(() => {
        const map = new Map<string, Product>(); // Store full product for UPI access
        allProducts.forEach(p => map.set(p.id, p));
        return map;
    }, [allProducts]);


    const handleQuantityChange = async (productId: string, newQuantity: number) => {
         const productInfo = productMap.get(productId);
         const maxQuantity = productInfo?.availableQuantity ?? 0;

        if (newQuantity < 0) return;
        if (newQuantity > maxQuantity) {
             toast({
                variant: 'destructive',
                title: 'Stock Limit Reached',
                description: `Only ${maxQuantity} units of ${productInfo?.name || 'this item'} available.`,
            });
             newQuantity = maxQuantity;
        }

        setIsUpdating(productId);
        try {
             if (newQuantity === 0) {
                await removeItemFromCart(productId);
                toast({ title: 'Item Removed', description: `Removed from cart.` });
            } else {
                await updateItemQuantity(productId, newQuantity);
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
         } catch (err) {
            console.error("Error in clearCart component handler:", err);
         } finally {
            setIsClearing(false);
         }
     }

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => {
            const productInfo = productMap.get(item.productId);
            const price = productInfo?.price ?? item.productDetails?.price ?? 0;
            return total + price * item.quantity;
        }, 0);
    };

    const handleProceedToCheckout = async () => {
        if (!userId || !cart || cart.items.length === 0) {
            toast({ title: "Cart Empty", description: "Please add items to your cart before proceeding.", variant: "destructive" });
            return;
        }
        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === 'YOUR_RAZORPAY_KEY_ID_HERE') {
            toast({ title: "Razorpay Not Configured", description: "Payment gateway is not configured by the admin.", variant: "destructive" });
            console.error("Razorpay Key ID not found in environment variables.");
            return;
        }
        if (!razorpayLoaded) {
            toast({ title: "Payment Gateway Loading", description: "Please wait for Razorpay to load.", variant: "default" });
            return;
        }

        setIsProcessingPayment(true);

        const totalAmount = calculateTotal();
        const firstCartItem = cart.items[0];
        const firstProductInfo = productMap.get(firstCartItem.productId);
        const supplierUpiIdForNotes = firstProductInfo?.supplierUpiId || "N/A";

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: totalAmount * 100, // Amount in paise
            currency: "INR",
            name: "FarmEasy Connect Purchase",
            description: `Payment for ${cart.items.length} item(s)`,
            // image: "/logo.png", // Optional: Your logo
            handler: function (response: any) {
                // This function is called after payment is successful
                toast({ title: "Payment Successful", description: `Payment ID: ${response.razorpay_payment_id}` });
                // Here you would typically:
                // 1. Verify the payment signature on your backend (IMPORTANT for production)
                // 2. Create an order in your database
                // 3. Clear the cart
                clearCart();
                setIsProcessingPayment(false);
            },
            prefill: {
                // name: "Farmer Name", // Get from auth context if available
                // email: "farmer@example.com", // Get from auth context
                // contact: "9999999999" // Get from auth context
            },
            notes: {
                cart_items: cart.items.map(item => `${item.productDetails?.name || productMap.get(item.productId)?.name} (Qty: ${item.quantity})`).join(', '),
                userId: userId,
                supplier_upi_id_of_first_item: supplierUpiIdForNotes, // For info
            },
            theme: {
                color: "#16A34A" // Primary green color
            },
            modal: {
                ondismiss: function() {
                    setIsProcessingPayment(false);
                    toast({ title: "Payment Cancelled", description: "Payment process was cancelled.", variant: "default" });
                }
            }
        };

        try {
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any){
                toast({
                    title: "Payment Failed",
                    description: `Error: ${response.error.description} (Code: ${response.error.code})`,
                    variant: "destructive"
                });
                setIsProcessingPayment(false);
            });
            rzp.open();
        } catch (error) {
            console.error("Razorpay Error:", error);
            toast({ title: "Payment Error", description: "Could not initiate payment. Please try again.", variant: "destructive" });
            setIsProcessingPayment(false);
        }
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
                <Script
                    id="razorpay-checkout-js"
                    src="https://checkout.razorpay.com/v1/checkout.js"
                    onLoad={() => setRazorpayLoaded(true)}
                />
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
                 <CardFooter className="flex justify-between items-center">
                     <Skeleton className="h-10 w-24" />
                     <Skeleton className="h-10 w-40" />
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
                <Script
                    id="razorpay-checkout-js"
                    src="https://checkout.razorpay.com/v1/checkout.js"
                    onLoad={() => setRazorpayLoaded(true)}
                />
                <CardHeader>
                    <CardTitle>Your Cart is Empty</CardTitle>
                     <ShoppingCartIcon className="mx-auto h-16 w-16 text-muted-foreground my-4" />
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
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
                onLoad={() => {
                    console.log("Razorpay script loaded.");
                    setRazorpayLoaded(true);
                }}
                onError={(e) => {
                    console.error("Failed to load Razorpay script:", e);
                    toast({ title: "Payment Error", description: "Could not load payment gateway.", variant: "destructive"});
                }}
            />
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
                             const maxQuantity = productInfo?.availableQuantity ?? item.quantity;
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
                                                 onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value, 10) || 0)}
                                                min="0"
                                                 max={maxQuantity}
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
                                    <TableCell className="text-right">₹{price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">₹{subtotal.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleQuantityChange(item.productId, 0)}
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
                             <TableCell className="text-right font-bold text-lg">₹{calculateTotal().toFixed(2)}</TableCell>
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
             <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <Button variant="outline" asChild>
                    <Link href="/farmer/shop">Continue Shopping</Link>
                </Button>
                 <Button
                    onClick={handleProceedToCheckout}
                    disabled={isProcessingPayment || !razorpayLoaded || !cart || cart.items.length === 0}
                    className="w-full sm:w-auto"
                >
                    {isProcessingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                    Proceed to Checkout
                </Button>
            </CardFooter>
        </Card>
    );
}
