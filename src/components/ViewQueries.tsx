// src/components/ViewQueries.tsx
'use client';

import React, { useState } from 'react';
import { useQueries } from '@/hooks/useQueries';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Loader2, Send, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function ViewQueries() {
    const { userId } = useAuth(); // KVK User ID (for potential future use, though not strictly needed for viewing all queries)
    const { queries, isLoading, error, answerQuery } = useQueries(); // Get queries and answer function
    const { toast } = useToast();
    const [answeringQueryId, setAnsweringQueryId] = useState<string | null>(null);
    const [answerText, setAnswerText] = useState('');
    const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

    const handleAnswerSubmit = async (queryId: string) => {
        if (!answerText.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Answer cannot be empty.' });
            return;
        }
        setIsSubmittingAnswer(true);
        try {
            await answerQuery(queryId, answerText);
            toast({ title: 'Success', description: 'Answer submitted successfully.' });
            setAnsweringQueryId(null); // Close accordion item after answering (optional)
            setAnswerText(''); // Clear textarea
        } catch (err) {
            console.error("Failed to submit answer:", err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit answer. Please try again.' });
        } finally {
            setIsSubmittingAnswer(false);
        }
    };

    const renderSkeleton = () => (
        <Card className="shadow-sm mb-4">
            <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-1" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-full" />
            </CardContent>
             <CardFooter>
                 <Skeleton className="h-8 w-24" />
             </CardFooter>
        </Card>
    );

    if (isLoading) {
        return (
            <div>
                {renderSkeleton()}
                {renderSkeleton()}
                {renderSkeleton()}
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Queries</AlertTitle>
                <AlertDescription>
                    Failed to load farmer queries: {error.message}. Please try refreshing.
                </AlertDescription>
            </Alert>
        );
    }

    if (!isLoading && queries.length === 0) {
        return (
            <Card className="shadow-md text-center">
                <CardHeader>
                    <CardTitle>No Queries Found</CardTitle>
                    <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground my-4" />
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">There are currently no questions submitted by farmers.</p>
                </CardContent>
            </Card>
        );
    }

    // Separate new and answered queries
    const newQueries = queries.filter(q => q.status === 'new');
    const answeredQueries = queries.filter(q => q.status === 'answered');

    return (
        <div className="space-y-6">
            {/* New Queries Section */}
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-primary flex items-center">
                    <MessageSquare className="mr-2 h-6 w-6" /> New Queries ({newQueries.length})
                 </h2>
                {newQueries.length === 0 ? (
                     <p className="text-muted-foreground italic">No new queries.</p>
                ) : (
                     <Accordion type="single" collapsible className="w-full space-y-4">
                        {newQueries.map((query) => (
                            <AccordionItem value={query.id} key={query.id} className="border bg-card rounded-lg shadow-sm">
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <div className="flex-1 text-left">
                                        <p className="font-medium text-foreground truncate max-w-md lg:max-w-xl">{query.questionText}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Asked by Farmer ID: {query.farmerId} • {formatDistanceToNow(new Date(query.timestamp), { addSuffix: true })}
                                        </p>
                                    </div>
                                     <Badge variant="secondary" className="ml-4">New</Badge>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6 pt-0">
                                     <p className="text-foreground mb-4 whitespace-pre-wrap">{query.questionText}</p>
                                    <div className="space-y-2">
                                        <Textarea
                                            placeholder="Type your answer here..."
                                            rows={4}
                                            value={answeringQueryId === query.id ? answerText : ''}
                                            onChange={(e) => {
                                                setAnsweringQueryId(query.id); // Ensure we track which query is being answered
                                                setAnswerText(e.target.value);
                                            }}
                                            disabled={isSubmittingAnswer}
                                            className="bg-background"
                                        />
                                        <Button
                                            onClick={() => handleAnswerSubmit(query.id)}
                                            disabled={isSubmittingAnswer || (answeringQueryId === query.id && !answerText.trim())}
                                            size="sm"
                                        >
                                            {isSubmittingAnswer && answeringQueryId === query.id ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Send className="mr-2 h-4 w-4" />
                                            )}
                                            Submit Answer
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>

            {/* Answered Queries Section */}
             <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center">
                     <CheckCircle2 className="mr-2 h-6 w-6 text-green-600" /> Answered Queries ({answeredQueries.length})
                 </h2>
                 {answeredQueries.length === 0 ? (
                     <p className="text-muted-foreground italic">No queries answered yet.</p>
                 ) : (
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {answeredQueries.map((query) => (
                             <AccordionItem value={query.id} key={query.id} className="border bg-card rounded-lg shadow-sm opacity-80">
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <div className="flex-1 text-left">
                                         <p className="font-medium text-foreground truncate max-w-md lg:max-w-xl">{query.questionText}</p>
                                         <p className="text-xs text-muted-foreground mt-1">
                                             Asked by Farmer ID: {query.farmerId} • {formatDistanceToNow(new Date(query.timestamp), { addSuffix: true })}
                                         </p>
                                    </div>
                                     <Badge variant="default" className="ml-4 bg-green-600 hover:bg-green-700">Answered</Badge>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6 pt-0 space-y-3">
                                     <div className="bg-background p-4 border rounded-md">
                                         <p className="text-sm font-semibold text-primary mb-1">Question:</p>
                                         <p className="text-sm text-foreground whitespace-pre-wrap">{query.questionText}</p>
                                     </div>
                                     <div className="bg-secondary p-4 border border-primary/50 rounded-md">
                                         <p className="text-sm font-semibold text-primary mb-1">Answer:</p>
                                         <p className="text-sm text-secondary-foreground whitespace-pre-wrap">{query.answerText}</p>
                                         {query.answeredAt && (
                                             <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                                                 <Clock className="inline-block h-3 w-3 mr-1"/> Answered {formatDistanceToNow(new Date(query.answeredAt), { addSuffix: true })}
                                             </p>
                                         )}
                                    </div>
                                </AccordionContent>
                             </AccordionItem>
                        ))}
                    </Accordion>
                 )}
            </div>
        </div>
    );
}
