
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
        console.log("Attempting to connect to Firestore for announcements...");

        const q = query(collection(db, ANNOUNCEMENTS_COLLECTION), orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            console.log("Received announcements snapshot. Processing...");
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
            setError(null); // Clear previous errors on successful fetch
        }, (err) => {
            console.error("Error fetching announcements from Firestore:", err);
            console.error("Error details:", JSON.stringify(err)); // Log more details
            if (err.code === 'permission-denied') {
                console.error("Firestore permission denied. Check your security rules.");
                setError(new Error('Permission denied. Please check Firestore security rules.'));
            } else {
                setError(err instanceof Error ? err : new Error('Failed to fetch announcements.'));
            }
            setIsLoading(false);
        });

        return () => {
            console.log("Unsubscribing from announcements listener.");
            unsubscribe();
        }
    }, []);

    const addAnnouncement = useCallback(async (text: string): Promise<void> => {
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
            throw err; // Re-throw for the component to catch and potentially show a toast
        }
    }, []);

    const deleteAnnouncement = useCallback(async (id: string): Promise<void> => {
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
        // However, forcing a re-check could be done by re-setting up the listener,
        // but that's complex and usually not needed if onSnapshot is working.
        // For now, it just indicates that real-time updates are active.
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
