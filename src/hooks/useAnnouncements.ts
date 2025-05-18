
// src/hooks/useAnnouncements.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    addDoc,
    deleteDoc,
    query,
    orderBy,
    onSnapshot,
    Timestamp,
    doc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Announcement } from '@/types';

const ANNOUNCEMENTS_COLLECTION = 'announcements';

export function useAnnouncements() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const q = query(collection(db, ANNOUNCEMENTS_COLLECTION), orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedAnnouncements: Announcement[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                 const timestampMillis = data.timestamp instanceof Timestamp
                 ? data.timestamp.toMillis()
                 : typeof data.timestamp === 'number'
                 ? data.timestamp
                 : Date.now();

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

        return () => unsubscribe();
    }, []);

    const addAnnouncement = useCallback(async (text: string): Promise<void> => {
        // Removed setIsLoading(true) and setIsLoading(false) from here.
        // The component triggering addAnnouncement (e.g., AnnouncementForm)
        // should manage its own submission loading state.
        // The onSnapshot listener will handle updating the announcements list.
        try {
            await addDoc(collection(db, ANNOUNCEMENTS_COLLECTION), {
                text: text,
                timestamp: serverTimestamp(),
            });
        } catch (err: any) {
            console.error("Failed to add announcement:", err);
            // setError(err instanceof Error ? err : new Error('Failed to add announcement')); // Let component handle specific error display
            throw err; // Re-throw for the component to catch and potentially show a toast
        }
    }, []);

    const deleteAnnouncement = useCallback(async (id: string): Promise<void> => {
        // No global isLoading manipulation for delete.
        // The component triggering delete (ExistingAnnouncements) manages its own deleting state.
        // The onSnapshot listener will handle updating the announcements list.
        try {
            const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
            await deleteDoc(docRef);
        } catch (err: any) {
            console.error("Failed to delete announcement:", err);
             throw err; // Re-throw for the component to catch
        }
    }, []);

    const refreshAnnouncements = useCallback(() => {
        // This function is less critical with onSnapshot, as updates are real-time.
        // Kept for potential explicit refresh scenarios if ever needed.
        console.log("Real-time updates for announcements are active via onSnapshot.");
    }, []);

    return {
        announcements,
        isLoading, // Reflects the listener's loading state for the initial fetch.
        error,
        addAnnouncement,
        deleteAnnouncement,
        refreshAnnouncements
    };
}
