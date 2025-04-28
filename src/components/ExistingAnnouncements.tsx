// src/components/ExistingAnnouncements.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Import AlertDialog components
import { formatDistanceToNow } from 'date-fns';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Loader2, Trash2 } from 'lucide-react'; // Import icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';


export default function ExistingAnnouncements() {
    const { userType } = useAuth(); // Get user type to conditionally show delete button
    const { announcements, isLoading, error, deleteAnnouncement } = useAnnouncements();
    const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track which announcement is being deleted
    const { toast } = useToast();

    const handleDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            await deleteAnnouncement(id);
            toast({
                title: 'Success',
                description: 'Announcement deleted successfully.',
            });
        } catch (err) {
            console.error("Failed to delete announcement:", err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete announcement. Please try again.',
            });
        } finally {
            setIsDeleting(null); // Reset deleting state regardless of outcome
        }
    };

     if (isLoading && announcements.length === 0) { // Show skeleton only on initial load
        return (
             <Card className="shadow-md">
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                 </CardHeader>
                <CardContent className="space-y-4 pt-4">
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
                    Failed to load announcements: {error.message}. Please try refreshing the page.
                </AlertDescription>
            </Alert>
       );
    }

    if (!isLoading && announcements.length === 0) {
        return (
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>No Announcements</CardTitle>
                    <CardDescription>There are currently no announcements posted.</CardDescription>
                </CardHeader>
                 <CardContent>
                    {userType === 'KVK' && (
                         <p className="text-sm text-muted-foreground">Use the form to post a new announcement.</p>
                    )}
                     {userType === 'FARMER' && (
                         <p className="text-sm text-muted-foreground">Check back later for updates from KVK.</p>
                    )}
                 </CardContent>
            </Card>
        );
    }

    // Announcements are already sorted by Firestore query (desc)
    // const sortedAnnouncements = [...announcements].sort((a, b) => b.timestamp - a.timestamp);


    return (
        <Card className="shadow-md">
            {/* Optional Header */}
            {/* <CardHeader>
                 <CardTitle>Posted Announcements</CardTitle>
                 <CardDescription>Latest updates</CardDescription>
            </CardHeader> */}
            <CardContent className="p-0"> {/* Remove default padding if ScrollArea has its own */}
                 <ScrollArea className="h-[400px] rounded-md border p-4 bg-card shadow-inner">
                     {isLoading && announcements.length > 0 && ( // Show subtle loading indicator when refreshing
                        <div className="flex justify-center items-center p-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-muted-foreground text-sm">Loading updates...</span>
                        </div>
                     )}
                     <div className="space-y-4">
                        {announcements.map((announcement, index) => (
                            <React.Fragment key={announcement.id}>
                                <div className="bg-background/50 border-l-4 border-primary p-4 rounded flex justify-between items-start group">
                                    <div>
                                        <p className="text-sm text-foreground break-words">{announcement.text}</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                             Posted {formatDistanceToNow(new Date(announcement.timestamp), { addSuffix: true })}
                                        </p>
                                    </div>
                                     {userType === 'KVK' && (
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                 <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`ml-2 h-8 w-8 text-muted-foreground hover:text-destructive transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 ${isDeleting === announcement.id ? 'cursor-not-allowed' : ''}`}
                                                    disabled={isDeleting === announcement.id}
                                                    aria-label="Delete announcement"
                                                >
                                                    {isDeleting === announcement.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the announcement.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel disabled={!!isDeleting}>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(announcement.id)}
                                                    disabled={!!isDeleting}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                     {isDeleting === announcement.id ? 'Deleting...' : 'Delete'}
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                     )}
                                </div>
                                {index < announcements.length - 1 && <Separator />}
                            </React.Fragment>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
