
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
    QueryConstraint, 
    limit // Import limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Query } from '@/types';

const QUERIES_COLLECTION = 'queries';

export function useQueries(farmerId?: string) { 
    const [queries, setQueries] = useState<Query[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const queryConstraints: QueryConstraint[] = [];

        if (farmerId) {
            queryConstraints.push(where('farmerId', '==', farmerId));
            queryConstraints.push(orderBy('timestamp', 'desc'));
            queryConstraints.push(limit(25)); // Limit farmer's own queries
        } else {
            queryConstraints.push(orderBy('status', 'asc')); 
            queryConstraints.push(orderBy('timestamp', 'desc')); 
            queryConstraints.push(limit(50)); // Limit KVK's view of all queries
        }

        const q = query(collection(db, QUERIES_COLLECTION), ...queryConstraints);


        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedQueries: Query[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const timestampMillis = data.timestamp instanceof Timestamp
                    ? data.timestamp.toMillis()
                    : typeof data.timestamp === 'number' 
                    ? data.timestamp
                    : Date.now(); 
                 const answeredAtMillis = data.answeredAt instanceof Timestamp
                    ? data.answeredAt.toMillis()
                    : typeof data.answeredAt === 'number' 
                    ? data.answeredAt
                    : undefined;

                fetchedQueries.push({
                    id: doc.id,
                    farmerId: data.farmerId,
                    questionText: data.questionText,
                    timestamp: timestampMillis,
                    status: data.status || 'new', 
                    answerText: data.answerText || undefined, 
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

        return () => unsubscribe();
    }, [farmerId]); 

    const addQuery = useCallback(async (fId: string, questionText: string): Promise<void> => {
        if (!fId) throw new Error('Farmer ID is required.');
        try {
            await addDoc(collection(db, QUERIES_COLLECTION), {
                farmerId: fId,
                questionText: questionText,
                timestamp: serverTimestamp(),
                status: 'new', 
                answerText: null,
                answeredAt: null,
            });
        } catch (err: any) {
            console.error("Failed to add query:", err);
            throw err;
        }
    }, []);

    const answerQuery = useCallback(async (queryId: string, answerText: string): Promise<void> => {
        try {
            const docRef = doc(db, QUERIES_COLLECTION, queryId);
            await updateDoc(docRef, {
                answerText: answerText,
                status: 'answered',
                answeredAt: serverTimestamp(),
            });
        } catch (err: any) {
            console.error("Failed to answer query:", err);
            throw err;
        }
    }, []);


    return {
        queries, 
        isLoading,
        error,
        addQuery,
        answerQuery,
    };
}
