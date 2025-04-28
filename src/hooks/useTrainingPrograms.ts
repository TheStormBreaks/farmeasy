
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
    getDocs // Import getDocs for querying registrations
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { TrainingProgram } from '@/types';

const PROGRAMS_COLLECTION = 'trainingPrograms';
const REGISTRATIONS_COLLECTION = 'registrations'; // For deleting registrations when program is deleted

export function useTrainingPrograms(kvkId?: string) { // Optional kvkId for filtering
    const [programs, setPrograms] = useState<TrainingProgram[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Fetch programs using onSnapshot
    useEffect(() => {
        setIsLoading(true);
        setError(null);

        // Base query ordered by creation date descending
        let q = query(collection(db, PROGRAMS_COLLECTION), orderBy('createdAt', 'desc'));

        // Apply filter if kvkId is provided (for KVK view)
        if (kvkId) {
            q = query(q, where('kvkId', '==', kvkId));
        }

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedPrograms: TrainingProgram[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const createdAtMillis = data.createdAt instanceof Timestamp
                    ? data.createdAt.toMillis()
                    : Date.now();
                const dateMillis = data.date instanceof Timestamp
                    ? data.date.toMillis()
                    : typeof data.date === 'number' ? data.date : Date.now(); // Handle number type
                 const deadlineMillis = data.registrationDeadline instanceof Timestamp
                    ? data.registrationDeadline.toMillis()
                    : typeof data.registrationDeadline === 'number' ? data.registrationDeadline : undefined; // Handle number type

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
            // Optionally filter out past programs for Farmer view here if needed
            // const currentPrograms = kvkId ? fetchedPrograms : fetchedPrograms.filter(p => p.date >= Date.now());
             setPrograms(fetchedPrograms);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching training programs:", err);
            setError(err instanceof Error ? err : new Error('Failed to fetch programs'));
            setIsLoading(false);
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [kvkId]); // Re-run if kvkId changes

    // Function to add a new program
    const addProgram = useCallback(async (programData: Omit<TrainingProgram, 'id' | 'createdAt'>): Promise<string> => {
        if (!programData.kvkId) throw new Error('KVK ID is required.');
        setIsLoading(true); // Consider local loading state in component instead
        try {
            const docRef = await addDoc(collection(db, PROGRAMS_COLLECTION), {
                ...programData,
                createdAt: serverTimestamp(),
            });
            return docRef.id;
        } catch (err: any) {
            console.error("Failed to add training program:", err);
            setError(err instanceof Error ? err : new Error('Failed to add program'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Function to update an existing program
    const updateProgram = useCallback(async (id: string, updates: Partial<Omit<TrainingProgram, 'id' | 'createdAt' | 'kvkId'>>): Promise<void> => {
        setIsLoading(true);
        try {
            const docRef = doc(db, PROGRAMS_COLLECTION, id);
            await updateDoc(docRef, {
                ...updates,
                // Note: We don't update createdAt, kvkId
            });
        } catch (err: any) {
            console.error("Failed to update training program:", err);
            setError(err instanceof Error ? err : new Error('Failed to update program'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

     // Function to delete a program and its registrations
    const deleteProgram = useCallback(async (id: string): Promise<void> => {
        // Consider local loading state in component
        try {
            // 1. Delete associated registrations first
            const regQuery = query(collection(db, REGISTRATIONS_COLLECTION), where('programId', '==', id));
            const regSnapshot = await getDocs(regQuery);
            const batch = db.batch(); // Use Firestore batch for atomic delete
             regSnapshot.forEach(regDoc => {
                 batch.delete(regDoc.ref);
             });
             await batch.commit(); // Commit registration deletions

            // 2. Delete the program itself
            const docRef = doc(db, PROGRAMS_COLLECTION, id);
            await deleteDoc(docRef);

        } catch (err: any) {
            console.error("Failed to delete training program or registrations:", err);
            // Let component handle error display
            throw err;
        }
    }, []);


    return {
        programs, // Contains programs (filtered if kvkId provided)
        isLoading,
        error,
        addProgram,
        updateProgram,
        deleteProgram,
    };
}
