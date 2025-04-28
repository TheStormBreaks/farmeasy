
// src/components/ViewMyRegistrations.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms'; // To get program details
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Calendar, Clock, MapPin, Trash2, Loader2, GraduationCap, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';
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
import type { TrainingProgram, Registration } from '@/types';

export default function ViewMyRegistrations() {
    const { userId } = useAuth();
    const { registrations, isLoading: regsLoading, error: regsError, cancelRegistration } = useRegistrations({ farmerId: userId || undefined });
    const { programs, isLoading: programsLoading, error: programsError } = useTrainingPrograms(); // Fetch all programs to link details
    const { toast } = useToast();
    const [isCancelling, setIsCancelling] = useState<string | null>(null); // Store registration ID being cancelled

    // Create a map of program ID to program details for quick lookup
    const programMap = useMemo(() => {
        const map = new Map<string, TrainingProgram>();
        programs.forEach(p => map.set(p.id, p));
        return map;
    }, [programs]);

    const handleCancelRegistration = async (registrationId: string, programTitle: string) => {
        setIsCancelling(registrationId);
        try {
            await cancelRegistration(registrationId);
            toast({
                title: 'Registration Cancelled',
                description: `Your registration for "${programTitle}" has been cancelled.`,
            });
        } catch (err) {
            console.error("Failed to cancel registration:", err);
             toast({
                variant: 'destructive',
                title: 'Cancellation Failed',
                description: 'Could not cancel your registration. Please try again.',
            });
        } finally {
            setIsCancelling(null);
        }
    };


    const renderSkeleton = () => (
        <Card className="shadow-sm">
             <CardHeader>
                 <Skeleton className="h-6 w-3/4" />
                 <Skeleton className="h-4 w-1/2 mt-2" />
                 <Skeleton className="h-4 w-1/3 mt-1" />
             </CardHeader>
             <CardContent>
                 <Skeleton className="h-8 w-24" /> {/* For Registered On */}
             </CardContent>
             <CardFooter>
                 <Skeleton className="h-10 w-32" /> {/* For Cancel Button */}
             </CardFooter>
        </Card>
    );

    if (regsLoading || programsLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderSkeleton()}
                {renderSkeleton()}
            </div>
        );
    }

    if (regsError || programsError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Registrations</AlertTitle>
                <AlertDescription>
                     {regsError?.message || programsError?.message || 'Failed to load your registration data.'}
                </AlertDescription>
            </Alert>
        );
    }

    if (!regsLoading && registrations.length === 0) {
        return (
             <Card className="shadow-md text-center col-span-full">
                 <CardHeader>
                    <CardTitle>No Registrations Found</CardTitle>
                    <Info className="mx-auto h-16 w-16 text-muted-foreground my-4" />
                 </CardHeader>
                 <CardContent>
                    <p className="text-muted-foreground">You haven't registered for any training programs yet.</p>
                     {/* Optional: Link to registration page */}
                     {/* <Button variant="link" asChild><Link href="/farmer/training">Browse Programs</Link></Button> */}
                 </CardContent>
             </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrations.map((reg) => {
                 const program = programMap.get(reg.programId);
                 if (!program) {
                    // Handle case where program details might not be loaded yet or program was deleted
                     return (
                        <Card key={reg.id} className="shadow-md opacity-70">
                            <CardHeader>
                                <CardTitle>Registered Program (Details Unavailable)</CardTitle>
                                 <CardDescription>Program ID: {reg.programId}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <p className='text-sm text-muted-foreground'>The details for this program could not be loaded. It might have been removed.</p>
                                 <p className="text-xs text-muted-foreground mt-2">Registered on: {format(new Date(reg.registrationTimestamp), "Pp")}</p>
                            </CardContent>
                            <CardFooter>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive border-destructive hover:bg-destructive/10"
                                             disabled={isCancelling === reg.id}
                                        >
                                             {isCancelling === reg.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                            Cancel Registration
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                         <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will cancel your registration for this program.
                                            </AlertDialogDescription>
                                         </AlertDialogHeader>
                                         <AlertDialogFooter>
                                            <AlertDialogCancel disabled={isCancelling === reg.id}>Back</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleCancelRegistration(reg.id, 'this program')}
                                                disabled={isCancelling === reg.id}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                 {isCancelling === reg.id ? 'Cancelling...' : 'Yes, Cancel'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    );
                 }

                 const isDeadlinePassed = program.registrationDeadline ? program.registrationDeadline < Date.now() : false;
                 const isProgramPast = program.date < Date.now(); // Check if the program date itself is past

                 return (
                     <Card key={reg.id} className={`shadow-md ${isProgramPast ? 'opacity-60 bg-muted/30' : ''}`}>
                        <CardHeader>
                             <CardTitle>{program.title}</CardTitle>
                            <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                                <p className="flex items-center"><Calendar className="h-4 w-4 mr-1.5" /> {format(new Date(program.date), "PPP")} {isProgramPast ? '(Completed)' : ''}</p>
                                <p className="flex items-center"><MapPin className="h-4 w-4 mr-1.5" /> {program.location}</p>
                                {program.registrationDeadline && (
                                     <p className={`flex items-center ${isDeadlinePassed ? 'text-destructive' : ''}`}>
                                        <Clock className="h-4 w-4 mr-1.5" />
                                        Reg. Deadline: {format(new Date(program.registrationDeadline), "PPP")} {isDeadlinePassed && !isProgramPast ? '(Passed)' : ''}
                                     </p>
                                )}
                            </div>
                         </CardHeader>
                         <CardContent>
                             <p className="text-xs text-muted-foreground">Registered on: {format(new Date(reg.registrationTimestamp), "Pp")}</p>
                         </CardContent>
                         <CardFooter>
                            {/* Only allow cancellation if the deadline hasn't passed and program is not past */}
                             {!isDeadlinePassed && !isProgramPast ? (
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive border-destructive hover:bg-destructive/10"
                                             disabled={isCancelling === reg.id}
                                        >
                                             {isCancelling === reg.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                            Cancel Registration
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                         <AlertDialogHeader>
                                            <AlertDialogTitle>Cancel Registration?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to cancel your registration for "{program.title}"?
                                            </AlertDialogDescription>
                                         </AlertDialogHeader>
                                         <AlertDialogFooter>
                                            <AlertDialogCancel disabled={isCancelling === reg.id}>Back</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleCancelRegistration(reg.id, program.title)}
                                                disabled={isCancelling === reg.id}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                 {isCancelling === reg.id ? 'Cancelling...' : 'Yes, Cancel'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                             ) : (
                                 <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
                                    {isProgramPast ? 'Program Completed' : 'Cancellation Unavailable'}
                                 </Button>
                             )}
                         </CardFooter>
                     </Card>
                 );
            })}
        </div>
    );
}

