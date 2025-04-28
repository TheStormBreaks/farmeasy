// src/hooks/useCart.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    Timestamp,
    serverTimestamp,
    collection,
    writeBatch, // For potential bulk updates if needed later
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Cart, CartItem, Product } from '@/types';
import { useToast } from '@/hooks/use-toast';

const CARTS_COLLECTION = 'carts';

export function useCart(userId: string | null) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const { toast } = useToast();

    // Fetch cart using onSnapshot for real-time updates
    useEffect(() => {
        if (!userId) {
            setCart(null); // Clear cart if user logs out
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        const cartDocRef = doc(db, CARTS_COLLECTION, userId);

        const unsubscribe = onSnapshot(cartDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                 const lastUpdatedMillis = data.lastUpdated instanceof Timestamp
                    ? data.lastUpdated.toMillis()
                    : typeof data.lastUpdated === 'number' ? data.lastUpdated : Date.now();

                 // Ensure items is always an array
                 const items = Array.isArray(data.items) ? data.items : [];

                setCart({
                    userId: docSnap.id,
                    items: items as CartItem[], // Assert type after check
                    lastUpdated: lastUpdatedMillis,
                });
            } else {
                // Cart doesn't exist, initialize an empty one locally
                 setCart({ userId: userId, items: [], lastUpdated: Date.now() });
                 // Optionally create the cart document in Firestore immediately
                 // createEmptyCart(userId);
            }
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching cart:", err);
            setError(err instanceof Error ? err : new Error('Failed to fetch cart'));
            setIsLoading(false);
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [userId]); // Re-run effect if userId changes

    // Function to create an empty cart document if it doesn't exist
    const createEmptyCart = useCallback(async (uid: string) => {
         if (!uid) return;
        const cartDocRef = doc(db, CARTS_COLLECTION, uid);
         try {
            await setDoc(cartDocRef, { userId: uid, items: [], lastUpdated: serverTimestamp() }, { merge: true }); // Use merge to avoid overwriting if created concurrently
        } catch (err) {
            console.error("Failed to create empty cart:", err);
            // Handle error (e.g., show toast)
        }
    }, []);

    // Function to add or update an item in the cart
    const addItemToCart = useCallback(async (productId: string, quantity: number, productDetails: CartItem['productDetails']): Promise<void> => {
        if (!userId) throw new Error('User not logged in.');
        if (quantity <= 0) throw new Error('Quantity must be positive.');

        const cartDocRef = doc(db, CARTS_COLLECTION, userId);
        setIsLoading(true); // Indicate loading during cart update

        try {
            const docSnap = await getDoc(cartDocRef);
            let currentItems: CartItem[] = [];
            if (docSnap.exists()) {
                 const data = docSnap.data();
                 // Ensure items is always an array before proceeding
                currentItems = Array.isArray(data.items) ? data.items : [];
            } else {
                 // If cart doc doesn't exist, create it first (or handle as error)
                 await createEmptyCart(userId); // Ensure cart exists
            }

            const existingItemIndex = currentItems.findIndex(item => item.productId === productId);
            let updatedItems: CartItem[];

            if (existingItemIndex > -1) {
                // Item exists, update quantity
                updatedItems = [...currentItems];
                updatedItems[existingItemIndex].quantity = quantity;
                // Optionally update productDetails if they changed
                if (productDetails) {
                     updatedItems[existingItemIndex].productDetails = {
                        ...updatedItems[existingItemIndex].productDetails, // Keep existing details
                         ...productDetails // Overwrite with new details
                     };
                }
            } else {
                // Item doesn't exist, add new item
                const newItem: CartItem = { productId, quantity, productDetails };
                updatedItems = [...currentItems, newItem];
            }

            await setDoc(cartDocRef, { items: updatedItems, lastUpdated: serverTimestamp() }, { merge: true });
            // Local state update will be handled by onSnapshot

        } catch (err: any) {
            console.error("Failed to add item to cart:", err);
            setError(err instanceof Error ? err : new Error('Failed to update cart'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [userId, createEmptyCart]);


      // Function to update item quantity
    const updateItemQuantity = useCallback(async (productId: string, newQuantity: number): Promise<void> => {
        if (!userId) throw new Error('User not logged in.');
        if (newQuantity < 0) throw new Error('Quantity cannot be negative.');

        const cartDocRef = doc(db, CARTS_COLLECTION, userId);
        setIsLoading(true);

        try {
            const docSnap = await getDoc(cartDocRef);
            if (!docSnap.exists()) {
                throw new Error("Cart not found.");
            }

            const data = docSnap.data();
            const currentItems = Array.isArray(data.items) ? data.items as CartItem[] : [];
            const itemIndex = currentItems.findIndex(item => item.productId === productId);

            if (itemIndex === -1) {
                // If item not found, treat as adding (or throw error depending on desired behavior)
                // For now, let's assume we only update existing items here
                 throw new Error("Item not found in cart to update.");
                // Or potentially call addItemToCart if newQuantity > 0
            }

            let updatedItems = [...currentItems];

            if (newQuantity === 0) {
                 // Remove item if quantity is 0
                 updatedItems.splice(itemIndex, 1);
            } else {
                 // Update quantity
                 updatedItems[itemIndex] = { ...updatedItems[itemIndex], quantity: newQuantity };
            }


            await setDoc(cartDocRef, { items: updatedItems, lastUpdated: serverTimestamp() }, { merge: true });
            // Local state updated by onSnapshot

        } catch (err: any) {
            console.error("Failed to update item quantity:", err);
            setError(err instanceof Error ? err : new Error('Failed to update cart quantity'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [userId]);


    // Function to remove an item from the cart
    const removeItemFromCart = useCallback(async (productId: string): Promise<void> => {
       await updateItemQuantity(productId, 0); // Use update function with quantity 0 to remove
    }, [updateItemQuantity]); // Depend on updateItemQuantity


     // Function to clear the entire cart
    const clearCart = useCallback(async (): Promise<void> => {
        if (!userId) throw new Error('User not logged in.');

        const cartDocRef = doc(db, CARTS_COLLECTION, userId);
        setIsLoading(true);
        try {
            // Set items to an empty array
            await setDoc(cartDocRef, { items: [], lastUpdated: serverTimestamp() }, { merge: true });
            // Local state update by onSnapshot
             toast({ title: 'Cart Cleared', description: 'All items have been removed from your cart.' });
        } catch (err: any) {
            console.error("Failed to clear cart:", err);
             toast({ variant: 'destructive', title: 'Error', description: 'Failed to clear cart.' });
            setError(err instanceof Error ? err : new Error('Failed to clear cart'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [userId, toast]);


    return {
        cart,
        isLoading,
        error,
        addItemToCart,
        removeItemFromCart,
        updateItemQuantity,
        clearCart,
    };
}
