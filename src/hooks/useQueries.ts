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

        let q;
        if (farmerId) {
            // Fetch queries only for a specific farmer
            q = query(
                collection(db, QUERIES_COLLECTION),
                where('farmerId', '==', farmerId),
                orderBy('timestamp', 'desc') // Show newest first
            );
        } else {
            // Fetch all queries (for KVK view)
            q = query(
                collection(db, QUERIES_COLLECTION),
                orderBy('status', 'asc'), // Show 'new' queries first
                orderBy('timestamp', 'desc') // Then sort by time within status
            );
        }

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedQueries: Query[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const timestampMillis = data.timestamp instanceof Timestamp
                    ? data.timestamp.toMillis()
                    : Date.now();
                 const answeredAtMillis = data.answeredAt instanceof Timestamp
                    ? data.answeredAt.toMillis()
                    : undefined;

                fetchedQueries.push({
                    id: doc.id,
                    farmerId: data.farmerId,
                    questionText: data.questionText,
                    timestamp: timestampMillis,
                    status: data.status,
                    answerText: data.answerText,
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
        setIsLoading(true); // Indicate loading during add
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
            setError(err instanceof Error ? err : new Error('Failed to add query'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Function for KVK to answer a query
    const answerQuery = useCallback(async (queryId: string, answerText: string): Promise<void> => {
        setIsLoading(true); // Indicate loading during update
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
            setError(err instanceof Error ? err : new Error('Failed to answer query'));
            throw err;
        } finally {
            setIsLoading(false);
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
