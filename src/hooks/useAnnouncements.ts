// src/hooks/useAnnouncements.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    addDoc,
    deleteDoc, // Import deleteDoc
    query,
    orderBy,
    onSnapshot,
    Timestamp,
    doc, // Import doc
    serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Import the initialized Firestore instance
import type { Announcement } from '@/types';

const ANNOUNCEMENTS_COLLECTION = 'announcements';

export function useAnnouncements() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Fetch announcements using onSnapshot for real-time updates
    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const q = query(collection(db, ANNOUNCEMENTS_COLLECTION), orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedAnnouncements: Announcement[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Ensure timestamp is correctly handled (Firebase returns Timestamp objects)
                 // Check if timestamp exists and is a Timestamp object
                 const timestampMillis = data.timestamp instanceof Timestamp
                 ? data.timestamp.toMillis()
                 : // If it's already a number (e.g., from older data or manual input), use it
                 typeof data.timestamp === 'number'
                 ? data.timestamp
                 : // Otherwise, provide a default or handle appropriately
                   Date.now(); // Use current time as a fallback

                fetchedAnnouncements.push({
                    id: doc.id,
                    text: data.text,
                    timestamp: timestampMillis,
                });
            });
            setAnnouncements(fetchedAnnouncements);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching announcements:", err);
            setError(err instanceof Error ? err : new Error('Failed to fetch announcements'));
            setIsLoading(false);
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, []); // Empty dependency array ensures this runs once on mount

    // Function to add a new announcement to Firestore
    const addAnnouncement = useCallback(async (text: string): Promise<void> => {
        setIsLoading(true); // Optional: show loading during add
        try {
            await addDoc(collection(db, ANNOUNCEMENTS_COLLECTION), {
                text: text,
                timestamp: serverTimestamp(), // Use server timestamp
            });
            // No need to manually update state, onSnapshot will handle it
        } catch (err: any) {
            console.error("Failed to add announcement:", err);
            setError(err instanceof Error ? err : new Error('Failed to add announcement'));
            throw err; // Re-throw error to be caught by the caller if needed
        } finally {
             setIsLoading(false); // Set loading false after operation
        }
    }, []);

    // Function to delete an announcement from Firestore
    const deleteAnnouncement = useCallback(async (id: string): Promise<void> => {
       // Don't set global isLoading for delete, manage locally in component
        try {
            const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
            await deleteDoc(docRef);
            // No need to manually update state, onSnapshot will handle it
        } catch (err: any) {
            console.error("Failed to delete announcement:", err);
            // Don't set global error, let component handle it
             throw err; // Re-throw error to be caught by the caller if needed
        }
    }, []);


    // Refresh function (relying on onSnapshot, but can be kept if explicit refresh needed elsewhere)
    const refreshAnnouncements = useCallback(() => {
        // onSnapshot handles real-time updates, so an explicit refresh
        // might not be strictly necessary unless triggering a re-fetch for other reasons.
        // If needed, could potentially re-run the query setup, but usually not required with onSnapshot.
        console.log("Real-time updates enabled via onSnapshot.");
    }, []);

    // Return state and functions
    return {
        announcements, // Already sorted by timestamp desc by the query
        isLoading,
        error,
        addAnnouncement,
        deleteAnnouncement, // Expose delete function
        refreshAnnouncements
    };
}