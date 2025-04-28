// src/components/DisplayAdvisory.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Info } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns'; // Using date-fns for formatting

const ADVISORY_DOC_ID = 'current_advisory';
const ADVISORY_COLLECTION = 'advisories';

export default function DisplayAdvisory() {
    const [advisory, setAdvisory] = useState<{ text: string; lastUpdated: number | null } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setIsLoading(true);
        const advisoryDocRef = doc(db, ADVISORY_COLLECTION, ADVISORY_DOC_ID);

        const unsubscribe = onSnapshot(advisoryDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const lastUpdatedMillis = data.lastUpdated instanceof Timestamp
                    ? data.lastUpdated.toMillis()
                    : typeof data.lastUpdated === 'number' ? data.lastUpdated : null;

                setAdvisory({
                    text: data.text || '',
                    lastUpdated: lastUpdatedMillis,
                });
            } else {
                setAdvisory(null); // No advisory set
            }
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching advisory:", err);
            setError(err instanceof Error ? err : new Error('Failed to fetch advisory'));
            setIsLoading(false);
        });

        return () => unsubscribe(); // Cleanup listener
    }, []);

    if (isLoading) {
        return (
            <Card className="shadow-md border-destructive bg-destructive/5">
                <CardHeader>
                     <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                     <Skeleton className="h-4 w-2/3" />
                     <Skeleton className="h-4 w-1/3 mt-4" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                 <AlertDescription>Could not load the advisory. Please try again later.</AlertDescription>
             </Alert>
        );
    }

    if (!advisory || !advisory.text) {
        return (
             <Alert variant="default" className='border-primary bg-primary/5'>
                 <Info className="h-4 w-4 text-primary" />
                 <AlertTitle className='text-primary'>No Active Advisory</AlertTitle>
                 <AlertDescription>There is currently no active crop or weather advisory from KVK.</AlertDescription>
             </Alert>
        );
    }

    return (
        <Card className="shadow-md border-l-4 border-destructive bg-destructive/5">
             {/* Removed CardHeader to make content more prominent */}
            <CardContent className="p-6">
                 {/* <AlertTriangle className="h-6 w-6 text-destructive mb-3" /> */}
                 <p className="text-foreground whitespace-pre-wrap">{advisory.text}</p>
                 {advisory.lastUpdated && (
                     <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-destructive/20">
                        Last updated: {format(new Date(advisory.lastUpdated), "PPPp")}
                    </p>
                 )}
            </CardContent>
        </Card>
    );
}
