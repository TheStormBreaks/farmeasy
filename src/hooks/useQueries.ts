// src/hooks/useQueries.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    addDoc,
    updateDoc,
    query,
    orderBy,
    onSnapshot,
    Timestamp,
    doc,
    where,
    serverTimestamp,
    QueryConstraint // Import QueryConstraint type
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Query } from '@/types';

const QUERIES_COLLECTION = 'queries';

export function useQueries(farmerId?: string) { // Optional farmerId to filter for farmer view
    const [queries, setQueries] = useState<Query[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Fetch queries using onSnapshot
    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const queryConstraints: QueryConstraint[] = [];

        if (farmerId) {
            // Constraints for Farmer view: Filter by farmerId, sort by timestamp descending
            queryConstraints.push(where('farmerId', '==', farmerId));
            queryConstraints.push(orderBy('timestamp', 'desc')); // Show newest asked first
        } else {
            // Constraints for KVK view: Sort by status ('new' first), then by timestamp descending
            queryConstraints.push(orderBy('status', 'asc')); // 'answered' after 'new'
            queryConstraints.push(orderBy('timestamp', 'desc')); // Show newest within status groups first
        }

        const q = query(collection(db, QUERIES_COLLECTION), ...queryConstraints);


        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedQueries: Query[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const timestampMillis = data.timestamp instanceof Timestamp
                    ? data.timestamp.toMillis()
                    : typeof data.timestamp === 'number' // Handle potential number timestamps
                    ? data.timestamp
                    : Date.now(); // Fallback
                 const answeredAtMillis = data.answeredAt instanceof Timestamp
                    ? data.answeredAt.toMillis()
                    : typeof data.answeredAt === 'number' // Handle potential number timestamps
                    ? data.answeredAt
                    : undefined;

                fetchedQueries.push({
                    id: doc.id,
                    farmerId: data.farmerId,
                    questionText: data.questionText,
                    timestamp: timestampMillis,
                    status: data.status || 'new', // Default to 'new' if status is missing
                    answerText: data.answerText || undefined, // Ensure it's string or undefined
                    answeredAt: answeredAtMillis,
                });
            });
            setQueries(fetchedQueries);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching queries:", err);
            setError(err instanceof Error ? err : new Error('Failed to fetch queries'));
            setIsLoading(false);
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [farmerId]); // Re-run effect if farmerId changes

    // Function for Farmer to add a new query
    const addQuery = useCallback(async (fId: string, questionText: string): Promise<void> => {
        if (!fId) throw new Error('Farmer ID is required.');
        // No need to set global loading state here, let form handle its own state
        try {
            await addDoc(collection(db, QUERIES_COLLECTION), {
                farmerId: fId,
                questionText: questionText,
                timestamp: serverTimestamp(),
                status: 'new', // Initial status
                answerText: null,
                answeredAt: null,
            });
            // onSnapshot handles state update
        } catch (err: any) {
            console.error("Failed to add query:", err);
            // Let the calling component handle the error (e.g., show toast)
            throw err;
        }
    }, []);

    // Function for KVK to answer a query
    const answerQuery = useCallback(async (queryId: string, answerText: string): Promise<void> => {
        // No need to set global loading state here, let answering component handle state
        try {
            const docRef = doc(db, QUERIES_COLLECTION, queryId);
            await updateDoc(docRef, {
                answerText: answerText,
                status: 'answered',
                answeredAt: serverTimestamp(),
            });
            // onSnapshot handles state update
        } catch (err: any) {
            console.error("Failed to answer query:", err);
            // Let the calling component handle the error
            throw err;
        }
    }, []);


    return {
        queries, // Sorted based on view (farmer or KVK)
        isLoading,
        error,
        addQuery,
        answerQuery,
    };
}
