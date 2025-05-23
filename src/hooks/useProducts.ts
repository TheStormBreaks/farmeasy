
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
    where, 
    serverTimestamp,
    writeBatch, 
    getDocs, 
    limit // Import limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, CartItem } from '@/types';

const PRODUCTS_COLLECTION = 'products';
const CARTS_COLLECTION = 'carts'; 

export function useProducts(supplierId?: string) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        let q;
        if (supplierId) {
            q = query(
                collection(db, PRODUCTS_COLLECTION),
                where('supplierId', '==', supplierId),
                orderBy('createdAt', 'desc'),
                limit(50) // Limit for a single supplier's products
            );
        } else {
            // Fetch all products (e.g., for Farmer view), limited
            q = query(
                collection(db, PRODUCTS_COLLECTION), 
                orderBy('createdAt', 'desc'),
                limit(50) // Limit for all products view
            );
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

        return () => unsubscribe();
    }, [supplierId]); 

    const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
        if (!productData.supplierId) {
            throw new Error('Supplier ID is required to add a product.');
        }
        // setIsLoading(true); // Removed to let form handle its own loading state
        try {
            const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
                ...productData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
             return docRef.id;
        } catch (err: any) {
            console.error("Failed to add product:", err);
            // setError(err instanceof Error ? err : new Error('Failed to add product')); // Let form handle error display
            throw err;
        } 
        // finally { setIsLoading(false); }
    }, []);

    const updateProduct = useCallback(async (id: string, updates: Partial<Omit<Product, 'id' | 'supplierId' | 'createdAt'>>): Promise<void> => {
        // setIsLoading(true); // Removed to let form handle its own loading state
        try {
            const docRef = doc(db, PRODUCTS_COLLECTION, id);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp(),
            });
             await updateProductInCarts(id, {
                name: updates.name,
                description: updates.description,
                price: updates.price,
             });
        } catch (err: any) {
            console.error("Failed to update product:", err);
            // setError(err instanceof Error ? err : new Error('Failed to update product')); // Let form handle error display
            throw err;
        } 
        // finally { setIsLoading(false); }
    }, []);

    const deleteProduct = useCallback(async (id: string): Promise<void> => {
        try {
            const docRef = doc(db, PRODUCTS_COLLECTION, id);
            await deleteDoc(docRef);
            await removeProductFromCarts(id);
        } catch (err: any) {
            console.error("Failed to delete product:", err);
            throw err;
        }
    }, []);


    const updateProductInCarts = async (productId: string, productUpdates: Partial<CartItem['productDetails']>) => {
        const cartSnapshots = await getDocs(collection(db, CARTS_COLLECTION));
        const batch = writeBatch(db);

        cartSnapshots.forEach(cartDoc => {
            const cartData = cartDoc.data();
            const items = cartData.items as CartItem[] || [];
            const itemIndex = items.findIndex(item => item.productId === productId);

            if (itemIndex > -1) {
                const updatedProductDetails = {
                    ...items[itemIndex].productDetails, 
                    ...productUpdates, 
                 };
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
        }
    };


    const removeProductFromCarts = async (productId: string) => {
         const cartSnapshots = await getDocs(collection(db, CARTS_COLLECTION));
         const batch = writeBatch(db);

         cartSnapshots.forEach(cartDoc => {
            const cartData = cartDoc.data();
            const items = cartData.items as CartItem[] || [];
            const updatedItems = items.filter(item => item.productId !== productId);

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
        products, 
        isLoading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
    };
}
