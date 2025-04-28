
// src/hooks/useRegistrations.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    Timestamp,
    doc,
    where,
    serverTimestamp,
    deleteDoc,
    getDocs, // For checking existing registration
    QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Registration } from '@/types';

const REGISTRATIONS_COLLECTION = 'registrations';

// Hook to fetch registrations (either for a specific program or a specific farmer)
export function useRegistrations(filter: { programId?: string; farmerId?: string }) {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const queryConstraints: QueryConstraint[] = [orderBy('registrationTimestamp', 'desc')];

        if (filter.programId) {
            queryConstraints.push(where('programId', '==', filter.programId));
        }
        if (filter.farmerId) {
            queryConstraints.push(where('farmerId', '==', filter.farmerId));
        }

        // If no filter is provided, this might fetch all registrations (consider permissions/scalability)
        if (!filter.programId && !filter.farmerId) {
            console.warn("Fetching all registrations without filter. Ensure this is intended.");
            // Potentially add a default limit or prevent fetch if needed
        }

         const q = query(collection(db, REGISTRATIONS_COLLECTION), ...queryConstraints);


        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedRegistrations: Registration[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const registrationTimestampMillis = data.registrationTimestamp instanceof Timestamp
                    ? data.registrationTimestamp.toMillis()
                    : typeof data.registrationTimestamp === 'number'
                    ? data.registrationTimestamp
                    : Date.now();

                fetchedRegistrations.push({
                    id: doc.id,
                    programId: data.programId,
                    farmerId: data.farmerId,
                    farmerName: data.farmerName,
                    mobileNumber: data.mobileNumber,
                    registrationTimestamp: registrationTimestampMillis,
                });
            });
            setRegistrations(fetchedRegistrations);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching registrations:", err);
            setError(err instanceof Error ? err : new Error('Failed to fetch registrations'));
            setIsLoading(false);
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [filter.programId, filter.farmerId]); // Re-run if filters change


    // Function for Farmer to add a registration
    const addRegistration = useCallback(async (registrationData: Omit<Registration, 'id' | 'registrationTimestamp'>): Promise<string | null> => {
        // Check if farmer is already registered for this program
         const q = query(collection(db, REGISTRATIONS_COLLECTION),
                         where('programId', '==', registrationData.programId),
                         where('farmerId', '==', registrationData.farmerId));
        const existingRegSnapshot = await getDocs(q);

        if (!existingRegSnapshot.empty) {
            console.log("Farmer already registered for this program.");
            // throw new Error("You are already registered for this program."); // Optionally throw error
             return null; // Indicate already registered
        }


        try {
            const docRef = await addDoc(collection(db, REGISTRATIONS_COLLECTION), {
                ...registrationData,
                registrationTimestamp: serverTimestamp(),
            });
            return docRef.id;
        } catch (err: any) {
            console.error("Failed to add registration:", err);
            throw err; // Re-throw for component to handle
        }
    }, []);

     // Function for Farmer to cancel a registration
    const cancelRegistration = useCallback(async (registrationId: string): Promise<void> => {
        try {
            const docRef = doc(db, REGISTRATIONS_COLLECTION, registrationId);
            await deleteDoc(docRef);
        } catch (err: any) {
            console.error("Failed to cancel registration:", err);
            throw err;
        }
    }, []);


    return {
        registrations,
        isLoading,
        error,
        addRegistration,
        cancelRegistration,
    };
}
