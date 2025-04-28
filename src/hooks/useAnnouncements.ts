'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Announcement } from '@/types';

const ANNOUNCEMENTS_STORAGE_KEY = 'announcements';

export function useAnnouncements() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Function to load announcements from localStorage
    const loadAnnouncements = useCallback(() => {
        setIsLoading(true);
        setError(null);
        try {
            const storedAnnouncements = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
            if (storedAnnouncements) {
                const parsedAnnouncements: Announcement[] = JSON.parse(storedAnnouncements);
                // Basic validation
                if (Array.isArray(parsedAnnouncements) && parsedAnnouncements.every(a => a.id && a.text && typeof a.timestamp === 'number')) {
                   setAnnouncements(parsedAnnouncements);
                } else {
                    console.warn("Invalid announcement data found in localStorage. Resetting.");
                    localStorage.removeItem(ANNOUNCEMENTS_STORAGE_KEY);
                    setAnnouncements([]);
                }
            } else {
                setAnnouncements([]);
            }
        } catch (err: any) {
            console.error("Failed to load announcements from localStorage:", err);
            setError(err instanceof Error ? err : new Error('Failed to load announcements'));
            setAnnouncements([]); // Reset on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load announcements on initial mount
    useEffect(() => {
        loadAnnouncements();

         // Optional: Add listener for storage events from other tabs/windows
         const handleStorageChange = (event: StorageEvent) => {
            if (event.key === ANNOUNCEMENTS_STORAGE_KEY) {
                 // console.log("Storage event detected for announcements, reloading...");
                loadAnnouncements(); // Reload if announcements change elsewhere
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);

    }, [loadAnnouncements]);

    // Function to add a new announcement
    const addAnnouncement = useCallback(async (text: string) => {
        return new Promise<void>((resolve, reject) => {
             setIsLoading(true); // Optional: Indicate loading state during add
             try {
                const newAnnouncement: Announcement = {
                    id: crypto.randomUUID(), // Generate unique ID
                    text: text,
                    timestamp: Date.now(),
                };

                let updatedAnnouncementsList: Announcement[] = [];
                // Use functional update to avoid race conditions
                setAnnouncements(prevAnnouncements => {
                    updatedAnnouncementsList = [newAnnouncement, ...prevAnnouncements];
                    // Return the new state array to update the state
                    return updatedAnnouncementsList;
                });

                // Persist to localStorage *after* queuing the state update
                localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(updatedAnnouncementsList));

                 setIsLoading(false);
                 resolve();
             } catch (err: any) {
                 console.error("Failed to add announcement:", err);
                  setError(err instanceof Error ? err : new Error('Failed to add announcement'));
                 setIsLoading(false);
                 reject(err);
             }
         });

    }, []);


    return { announcements, isLoading, error, addAnnouncement, refreshAnnouncements: loadAnnouncements };
}
