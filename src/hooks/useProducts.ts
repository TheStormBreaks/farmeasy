// src/hooks/useProducts.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    onSnapshot,
    Timestamp,
    doc,
    where, // Import where for filtering
    serverTimestamp,
    writeBatch, // Import writeBatch for bulk operations
    getDocs, // Import getDocs for fetching cart items
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, CartItem } from '@/types';

const PRODUCTS_COLLECTION = 'products';
const CARTS_COLLECTION = 'carts'; // Assuming carts are stored in a 'carts' collection

export function useProducts(supplierId?: string) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Fetch products using onSnapshot for real-time updates
    useEffect(() => {
        setIsLoading(true);
        setError(null);

        let q;
        if (supplierId) {
            // Fetch products only for a specific supplier
            q = query(
                collection(db, PRODUCTS_COLLECTION),
                where('supplierId', '==', supplierId),
                orderBy('createdAt', 'desc')
            );
        } else {
            // Fetch all products (e.g., for Farmer view)
            q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
        }


        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedProducts: Product[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const createdAtMillis = data.createdAt instanceof Timestamp
                    ? data.createdAt.toMillis()
                    : typeof data.createdAt === 'number' ? data.createdAt : Date.now();
                const updatedAtMillis = data.updatedAt instanceof Timestamp
                    ? data.updatedAt.toMillis()
                    : typeof data.updatedAt === 'number' ? data.updatedAt : Date.now();

                fetchedProducts.push({
                    id: doc.id,
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    availableQuantity: data.availableQuantity,
                    supplierId: data.supplierId,
                    createdAt: createdAtMillis,
                    updatedAt: updatedAtMillis,
                });
            });
            setProducts(fetchedProducts);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching products:", err);
            setError(err instanceof Error ? err : new Error('Failed to fetch products'));
            setIsLoading(false);
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [supplierId]); // Re-run effect if supplierId changes

    // Function to add a new product
    const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
        if (!productData.supplierId) {
            throw new Error('Supplier ID is required to add a product.');
        }
        setIsLoading(true);
        try {
            const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
                ...productData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            // No need to manually update state, onSnapshot handles it
             return docRef.id;
        } catch (err: any) {
            console.error("Failed to add product:", err);
            setError(err instanceof Error ? err : new Error('Failed to add product'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Function to update an existing product
    const updateProduct = useCallback(async (id: string, updates: Partial<Omit<Product, 'id' | 'supplierId' | 'createdAt'>>): Promise<void> => {
         setIsLoading(true);
        try {
            const docRef = doc(db, PRODUCTS_COLLECTION, id);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp(),
            });
            // Update product details in carts as well
             await updateProductInCarts(id, {
                name: updates.name,
                description: updates.description,
                price: updates.price,
             });
            // onSnapshot will handle local state update
        } catch (err: any) {
            console.error("Failed to update product:", err);
            setError(err instanceof Error ? err : new Error('Failed to update product'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Function to delete a product
    const deleteProduct = useCallback(async (id: string): Promise<void> => {
        try {
            const docRef = doc(db, PRODUCTS_COLLECTION, id);
            await deleteDoc(docRef);
            // Also remove the product from all carts
            await removeProductFromCarts(id);
            // onSnapshot will handle local state update
        } catch (err: any) {
            console.error("Failed to delete product:", err);
            throw err;
        }
    }, []);


    // Helper function to update product details in carts
    const updateProductInCarts = async (productId: string, productUpdates: Partial<CartItem['productDetails']>) => {
        const cartsQuery = query(collection(db, CARTS_COLLECTION), where(`items.${productId}`, '!=', null)); // This is a placeholder, Firestore doesn't directly support querying nested map keys like this easily. A better approach is needed.
        // **Alternative/Better Approach:** Query all carts and update client-side or use Cloud Functions.
        // **Simplified (less efficient) approach for now:** Fetch all carts containing the item.
        const cartSnapshots = await getDocs(collection(db, CARTS_COLLECTION));
        const batch = writeBatch(db);

        cartSnapshots.forEach(cartDoc => {
            const cartData = cartDoc.data();
            const items = cartData.items as CartItem[] || [];
            const itemIndex = items.findIndex(item => item.productId === productId);

            if (itemIndex > -1) {
                 // Merge existing details with new updates
                const updatedProductDetails = {
                    ...items[itemIndex].productDetails, // Keep existing details
                    ...productUpdates, // Apply updates (name, price, desc)
                 };
                 // Remove undefined values from the update object
                 Object.keys(updatedProductDetails).forEach(key => updatedProductDetails[key as keyof typeof updatedProductDetails] === undefined && delete updatedProductDetails[key as keyof typeof updatedProductDetails]);

                const updatedItems = [...items];
                updatedItems[itemIndex] = {
                    ...updatedItems[itemIndex],
                    productDetails: updatedProductDetails,
                };
                batch.update(cartDoc.ref, { items: updatedItems, lastUpdated: serverTimestamp() });
            }
        });

        try {
            await batch.commit();
            console.log(`Product details updated in relevant carts for product ${productId}`);
        } catch (error) {
            console.error("Error updating product in carts:", error);
            // Handle error appropriately
        }
    };


    // Helper function to remove a product from all carts
    const removeProductFromCarts = async (productId: string) => {
         // Similar limitation as updateProductInCarts applies here.
         // Fetch all carts and update those containing the item.
         const cartSnapshots = await getDocs(collection(db, CARTS_COLLECTION));
         const batch = writeBatch(db);

         cartSnapshots.forEach(cartDoc => {
            const cartData = cartDoc.data();
            const items = cartData.items as CartItem[] || [];
            const updatedItems = items.filter(item => item.productId !== productId);

            // If items were removed, update the cart document
            if (updatedItems.length < items.length) {
                 batch.update(cartDoc.ref, { items: updatedItems, lastUpdated: serverTimestamp() });
            }
         });

        try {
            await batch.commit();
            console.log(`Product ${productId} removed from all carts.`);
        } catch (error) {
            console.error("Error removing product from carts:", error);
        }
    };

    return {
        products, // Products based on the supplierId filter or all products
        isLoading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
    };
}
