'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ExistingAnnouncements() {
    const { announcements, isLoading, error } = useAnnouncements();

     if (isLoading) {
        return <p>Loading announcements...</p>; // Or a Skeleton loader
    }

    if (error) {
       return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to load announcements. Please try again later.
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
            </Card>
        );
    }

    // Sort announcements by timestamp, newest first
    const sortedAnnouncements = [...announcements].sort((a, b) => b.timestamp - a.timestamp);


    return (
        <ScrollArea className="h-[400px] rounded-md border p-4 bg-card shadow-inner">
             <div className="space-y-4">
                {sortedAnnouncements.map((announcement, index) => (
                    <React.Fragment key={announcement.id}>
                        <Card className="bg-background/50 border-l-4 border-primary">
                            <CardContent className="p-4">
                                <p className="text-sm text-foreground">{announcement.text}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                     Posted {formatDistanceToNow(new Date(announcement.timestamp), { addSuffix: true })}
                                </p>
                            </CardContent>
                        </Card>
                        {index < sortedAnnouncements.length - 1 && <Separator />}
                    </React.Fragment>
                ))}
            </div>
        </ScrollArea>
    );
}
