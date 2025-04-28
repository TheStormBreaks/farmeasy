// src/components/MyQueriesDisplay.tsx
'use client';

import React from 'react';
import { useQueries } from '@/hooks/useQueries';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Info, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';

export default function MyQueriesDisplay() {
    const { userId } = useAuth(); // Get the logged-in farmer's ID
    const { queries, isLoading, error } = useQueries(userId || undefined); // Pass farmerId to the hook

    const renderSkeleton = () => (
        <div className="space-y-4">
             <Skeleton className="h-16 w-full rounded-lg" />
             <Skeleton className="h-16 w-full rounded-lg" />
        </div>
    );

    if (!userId) {
        // Should ideally not happen if AuthGuard is working, but good to handle
        return <Alert variant="destructive">Error: User not logged in.</Alert>;
    }

    if (isLoading) {
        return renderSkeleton();
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Your Queries</AlertTitle>
                <AlertDescription>
                    Failed to load your submitted questions: {error.message}. Please try refreshing.
                </AlertDescription>
            </Alert>
        );
    }

    if (!isLoading && queries.length === 0) {
        return (
            <Card className="shadow-md text-center">
                <CardHeader>
                    <CardTitle>No Queries Yet</CardTitle>
                    <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground my-4" />
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You haven't asked any questions yet. Use the form above to submit one!</p>
                </CardContent>
            </Card>
        );
    }

    return (
         <Accordion type="single" collapsible className="w-full space-y-4">
            {queries.map((query) => (
                <AccordionItem value={query.id} key={query.id} className="border bg-card rounded-lg shadow-sm">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex-1 text-left">
                            <p className="font-medium text-foreground truncate max-w-md lg:max-w-xl">{query.questionText}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Asked {formatDistanceToNow(new Date(query.timestamp), { addSuffix: true })}
                            </p>
                        </div>
                         {query.status === 'answered' ? (
                             <Badge variant="default" className="ml-4 bg-green-600 hover:bg-green-700">Answered</Badge>
                         ) : (
                            <Badge variant="secondary" className="ml-4">Pending</Badge>
                         )}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-0 space-y-3">
                         {/* Original Question */}
                         <div className="bg-background p-3 border rounded-md">
                             <p className="text-sm font-semibold text-primary mb-1">Your Question:</p>
                             <p className="text-sm text-foreground whitespace-pre-wrap">{query.questionText}</p>
                         </div>
                         {/* Answer Section */}
                         {query.status === 'answered' && query.answerText ? (
                            <div className="bg-secondary p-3 border border-primary/50 rounded-md">
                                <p className="text-sm font-semibold text-primary mb-1 flex items-center">
                                    <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" /> KVK's Answer:
                                 </p>
                                <p className="text-sm text-secondary-foreground whitespace-pre-wrap">{query.answerText}</p>
                                {query.answeredAt && (
                                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                                        <Clock className="inline-block h-3 w-3 mr-1"/> Answered {formatDistanceToNow(new Date(query.answeredAt), { addSuffix: true })}
                                    </p>
                                )}
                            </div>
                         ) : (
                            <div className="bg-muted/50 p-3 border rounded-md">
                                 <p className="text-sm text-muted-foreground italic flex items-center">
                                    <Info className="h-4 w-4 mr-1" /> Awaiting response from KVK...
                                 </p>
                            </div>
                         )}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
