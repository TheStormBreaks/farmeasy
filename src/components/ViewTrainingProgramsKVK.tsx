
// src/components/ViewTrainingProgramsKVK.tsx
'use client';

import React, { useState } from 'react';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Calendar, Clock, Edit, Loader2, MapPin, Trash2, Users, GraduationCap } from 'lucide-react'; // Added Users icon
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';
import ViewRegistrations from '@/components/ViewRegistrations'; // Create this component
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import type { TrainingProgram } from '@/types';

interface ViewTrainingProgramsKVKProps {
    onEdit: (program: TrainingProgram) => void; // Function to trigger edit mode
}

export default function ViewTrainingProgramsKVK({ onEdit }: ViewTrainingProgramsKVKProps) {
    const { userId } = useAuth();
    const { programs, isLoading, error, deleteProgram } = useTrainingPrograms(userId || undefined); // Fetch programs for this KVK
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

     const handleDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            await deleteProgram(id);
            toast({
                title: 'Success',
                description: 'Training program and its registrations deleted successfully.',
            });
        } catch (err) {
            console.error("Failed to delete program:", err);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete training program. Please try again.',
            });
        } finally {
            setIsDeleting(null);
        }
    };

    const renderSkeleton = () => (
        <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
        </div>
    );

    if (isLoading) {
        return renderSkeleton();
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Training Programs</AlertTitle>
                <AlertDescription>
                    Failed to load programs: {error.message}. Please try refreshing.
                </AlertDescription>
            </Alert>
        );
    }

    if (!isLoading && programs.length === 0) {
        return (
            <Card className="shadow-md text-center">
                <CardHeader>
                    <CardTitle>No Training Programs Created</CardTitle>
                    <GraduationCap className="mx-auto h-16 w-16 text-muted-foreground my-4" />
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Click "Create New Training Program" to add your first session.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Accordion type="single" collapsible className="w-full space-y-4">
            {programs.map((program) => (
                <AccordionItem value={program.id} key={program.id} className="border bg-card rounded-lg shadow-sm">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                        <div className="flex-1 text-left mr-4">
                            <p className="font-medium text-foreground text-lg">{program.title}</p>
                            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1 items-center">
                                <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {format(new Date(program.date), "PPP")}</span>
                                <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {program.location}</span>
                                {program.registrationDeadline && (
                                     <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> Deadline: {format(new Date(program.registrationDeadline), "PPP")}</span>
                                )}
                            </div>
                        </div>
                        {/* Action Buttons */}
                         <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                             <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(program); }} className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit Program</span>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                     <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-8 w-8 text-destructive hover:text-destructive/90 ${isDeleting === program.id ? 'cursor-not-allowed' : ''}`}
                                        disabled={isDeleting === program.id}
                                        onClick={(e) => e.stopPropagation()} // Prevent accordion toggle
                                    >
                                        {isDeleting === program.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                        <span className="sr-only">Delete Program</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the training program
                                            and all associated registrations.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={!!isDeleting}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDelete(program.id)}
                                            disabled={!!isDeleting}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            {isDeleting === program.id ? 'Deleting...' : 'Delete Program'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                         </div>
                         <Users className="h-5 w-5 text-primary" /> {/* Icon indicating registrations */}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-0 space-y-4">
                         <div className="bg-background p-4 border rounded-md">
                             <p className="text-sm font-semibold text-primary mb-2">Program Details:</p>
                             <p className="text-sm text-foreground whitespace-pre-wrap">{program.description}</p>
                         </div>
                         {/* View Registrations Component */}
                         <div>
                            <h4 className="text-md font-semibold text-foreground mb-3">Registrations:</h4>
                            <ViewRegistrations programId={program.id} />
                         </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
