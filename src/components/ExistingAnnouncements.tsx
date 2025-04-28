'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton


export default function ExistingAnnouncements() {
    // Use the hook directly. It manages loading, error, and data state.
    const { announcements, isLoading, error, refreshAnnouncements } = useAnnouncements();

    // Optional: Refresh announcements when the component mounts,
    // especially if it might be mounted after an announcement was added
    // but before the hook's internal listener picked up the change.
    useEffect(() => {
        refreshAnnouncements();
    }, [refreshAnnouncements]);

     if (isLoading) {
        // Display Skeleton loaders while loading
        return (
             <Card className="shadow-md">
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                 </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Separator />
                    <Skeleton className="h-16 w-full" />
                     <Separator />
                     <Skeleton className="h-16 w-full" />
                </CardContent>
             </Card>
         );
    }

    if (error) {
       return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to load announcements: {error.message}. Please try refreshing.
                </AlertDescription>
            </Alert>
       );
    }

    if (!announcements || announcements.length === 0) {
        return (
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>No Announcements</CardTitle>
                    <CardDescription>There are currently no announcements posted.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <p className="text-sm text-muted-foreground">KVK can post new announcements using the form.</p>
                 </CardContent>
            </Card>
        );
    }

    // The hook now provides announcements already sorted implicitly by addition order (newest first)
    // If explicit sorting is needed, ensure the hook does it or sort here:
    const sortedAnnouncements = [...announcements].sort((a, b) => b.timestamp - a.timestamp);


    return (
        <Card className="shadow-md">
            {/* Optional Header */}
            {/* <CardHeader>
                 <CardTitle>Posted Announcements</CardTitle>
                 <CardDescription>Latest updates</CardDescription>
            </CardHeader> */}
            <CardContent className="p-0"> {/* Remove default padding if ScrollArea has its own */}
                 <ScrollArea className="h-[400px] rounded-md border p-4 bg-card shadow-inner">
                     <div className="space-y-4">
                        {sortedAnnouncements.map((announcement, index) => (
                            <React.Fragment key={announcement.id}>
                                <div className="bg-background/50 border-l-4 border-primary p-4 rounded">
                                    <p className="text-sm text-foreground break-words">{announcement.text}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                         Posted {formatDistanceToNow(new Date(announcement.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                                {index < sortedAnnouncements.length - 1 && <Separator />}
                            </React.Fragment>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
