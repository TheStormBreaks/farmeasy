
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
        console.log("useAnnouncements: Hook mounted. Attempting to attach Firestore listener.");
        if (!db) {
            console.error("useAnnouncements Error: Firestore 'db' instance is not available. Cannot attach listener.");
            setError(new Error("Firestore is not initialized."));
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        
        const q = query(collection(db, ANNOUNCEMENTS_COLLECTION), orderBy('timestamp', 'desc'));
        console.log("useAnnouncements: Query created for announcements collection.");

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            console.log("useAnnouncements: onSnapshot triggered. Processing query snapshot...");
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
            console.log(`useAnnouncements: Fetched ${fetchedAnnouncements.length} announcements.`);
            setAnnouncements(fetchedAnnouncements);
            setIsLoading(false);
            setError(null); 
        }, (err) => {
            console.error("useAnnouncements: Error in onSnapshot listener:", err);
            console.error("useAnnouncements: Error details:", JSON.stringify(err)); 
            if ((err as any).code === 'permission-denied') {
                console.error("useAnnouncements: Firestore permission denied. Check your security rules.");
                setError(new Error('Permission denied. Please check Firestore security rules.'));
            } else {
                setError(err instanceof Error ? err : new Error('Failed to fetch announcements.'));
            }
            setIsLoading(false);
        });

        console.log("useAnnouncements: onSnapshot listener attached successfully.");

        return () => {
            console.log("useAnnouncements: Unsubscribing from announcements listener.");
            unsubscribe();
        }
    }, []);

    const addAnnouncement = useCallback(async (text: string): Promise<void> => {
        console.log("useAnnouncements: addAnnouncement called with text:", text);
        if (!db) {
            console.error("useAnnouncements Error: Firestore 'db' instance is not available for addAnnouncement.");
            throw new Error("Firestore is not initialized.");
        }
        try {
            await addDoc(collection(db, ANNOUNCEMENTS_COLLECTION), {
                text: text,
                timestamp: serverTimestamp(),
            });
            console.log("useAnnouncements: Announcement added successfully to Firestore.");
        } catch (err: any) {
            console.error("useAnnouncements: Failed to add announcement:", err);
            throw err; 
        }
    }, []);

    const deleteAnnouncement = useCallback(async (id: string): Promise<void> => {
        console.log("useAnnouncements: deleteAnnouncement called for ID:", id);
        if (!db) {
            console.error("useAnnouncements Error: Firestore 'db' instance is not available for deleteAnnouncement.");
            throw new Error("Firestore is not initialized.");
        }
        try {
            const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
            await deleteDoc(docRef);
            console.log("useAnnouncements: Announcement deleted successfully from Firestore.");
        } catch (err: any) {
            console.error("useAnnouncements: Failed to delete announcement:", err);
             throw err; 
        }
    }, []);

    const refreshAnnouncements = useCallback(() => {
        console.log("useAnnouncements: refreshAnnouncements called. Real-time updates are active via onSnapshot.");
    }, []);

    return {
        announcements,
        isLoading, 
        error,
        addAnnouncement,
        deleteAnnouncement,
        refreshAnnouncements
    };
}
