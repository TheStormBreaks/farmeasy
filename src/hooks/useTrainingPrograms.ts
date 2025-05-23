
// src/hooks/useTrainingPrograms.ts
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
    getDocs, 
    writeBatch, 
    QueryConstraint,
    limit // Import limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { TrainingProgram } from '@/types';

const PROGRAMS_COLLECTION = 'trainingPrograms';
const REGISTRATIONS_COLLECTION = 'registrations'; 

export function useTrainingPrograms(kvkId?: string) { 
    const [programs, setPrograms] = useState<TrainingProgram[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const queryConstraints: QueryConstraint[] = [];
        
        if (kvkId) {
            // KVK view: fetch programs for this KVK, newest first
            queryConstraints.push(where('kvkId', '==', kvkId));
            queryConstraints.push(orderBy('createdAt', 'desc'));
            queryConstraints.push(limit(25)); // Limit KVK's own programs list
        } else {
            // Farmer view: fetch all programs, ordered by date (upcoming first), then by creation.
            // Ideally, filter for date >= now on the server.
            // For now, just order by date and limit the overall fetch.
            queryConstraints.push(orderBy('date', 'asc')); // Show upcoming programs first
            // queryConstraints.push(orderBy('createdAt', 'desc')); // Secondary sort if dates are same
            queryConstraints.push(limit(50)); // Limit for farmer view
        }

         const q = query(collection(db, PROGRAMS_COLLECTION), ...queryConstraints);


        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedPrograms: TrainingProgram[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const createdAtMillis = data.createdAt instanceof Timestamp
                    ? data.createdAt.toMillis()
                    : typeof data.createdAt === 'number' ? data.createdAt : Date.now(); 
                const dateMillis = data.date instanceof Timestamp
                    ? data.date.toMillis()
                    : typeof data.date === 'number' ? data.date : Date.now(); 
                 const deadlineMillis = data.registrationDeadline instanceof Timestamp
                    ? data.registrationDeadline.toMillis()
                    : typeof data.registrationDeadline === 'number' ? data.registrationDeadline : undefined; 

                fetchedPrograms.push({
                    id: doc.id,
                    title: data.title,
                    description: data.description,
                    date: dateMillis,
                    location: data.location,
                    registrationDeadline: deadlineMillis,
                    createdAt: createdAtMillis,
                    kvkId: data.kvkId,
                });
            });
             setPrograms(fetchedPrograms);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching training programs:", err);
            setError(err instanceof Error ? err : new Error('Failed to fetch programs'));
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [kvkId]); 

    const addProgram = useCallback(async (programData: Omit<TrainingProgram, 'id' | 'createdAt'>): Promise<string> => {
        if (!programData.kvkId) throw new Error('KVK ID is required.');
        try {
            const docRef = await addDoc(collection(db, PROGRAMS_COLLECTION), {
                ...programData,
                createdAt: serverTimestamp(),
            });
            return docRef.id;
        } catch (err: any) {
            console.error("Failed to add training program:", err);
            throw err;
        } 
    }, []);

    const updateProgram = useCallback(async (id: string, updates: Partial<Omit<TrainingProgram, 'id' | 'createdAt' | 'kvkId'>>): Promise<void> => {
        try {
            const docRef = doc(db, PROGRAMS_COLLECTION, id);
            await updateDoc(docRef, {
                ...updates,
            });
        } catch (err: any) {
            console.error("Failed to update training program:", err);
            throw err;
        } 
    }, []);

    const deleteProgram = useCallback(async (id: string): Promise<void> => {
        try {
            const regQuery = query(collection(db, REGISTRATIONS_COLLECTION), where('programId', '==', id));
            const regSnapshot = await getDocs(regQuery);
            const batch = writeBatch(db); 
             regSnapshot.forEach(regDoc => {
                 batch.delete(regDoc.ref);
             });
             await batch.commit(); 

            const docRef = doc(db, PROGRAMS_COLLECTION, id);
            await deleteDoc(docRef);

        } catch (err: any) {
            console.error("Failed to delete training program or registrations:", err);
            throw err;
        }
    }, []);


    return {
        programs, 
        isLoading,
        error,
        addProgram,
        updateProgram,
        deleteProgram,
    };
}
