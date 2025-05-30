
// src/components/ViewTrainingProgramsFarmer.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useRegistrations } from '@/hooks/useRegistrations'; // To check if already registered
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Calendar, Clock, MapPin, CheckCircle, Loader2, GraduationCap, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';
import RegisterTrainingForm from '@/components/RegisterTrainingForm'; // Create this
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import type { TrainingProgram, Registration } from '@/types';
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


export default function ViewTrainingProgramsFarmer() {
    const { userId } = useAuth();
    const { programs, isLoading: programsLoading, error: programsError } = useTrainingPrograms(); // Fetch all programs
    const { registrations, isLoading: regsLoading, error: regsError, cancelRegistration } = useRegistrations({ farmerId: userId || undefined }); // Fetch this farmer's registrations
    const [isRegistering, setIsRegistering] = useState<string | null>(null); // Track which program is being registered for
    const [isCancelling, setIsCancelling] = useState<string | null>(null); // Track which registration is being cancelled
     const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
     const [isFormOpen, setIsFormOpen] = useState(false);
     const { toast } = useToast();

    // Filter programs to show only upcoming ones
    const upcomingPrograms = useMemo(() => {
        return programs.filter(p => p.date >= Date.now());
    }, [programs]);


     // Create a set of program IDs the farmer is registered for, for quick lookup
    const registeredProgramIds = useMemo(() => {
        return new Set(registrations.map(reg => reg.programId));
    }, [registrations]);

     // Create a map to find registration ID by program ID
     const registrationMap = useMemo(() => {
        return new Map(registrations.map(reg => [reg.programId, reg.id]));
    }, [registrations]);


     const handleOpenRegisterForm = (program: TrainingProgram) => {
        setSelectedProgram(program);
        setIsFormOpen(true);
     };

      const handleFormClose = (success?: boolean) => {
        setIsFormOpen(false);
        setSelectedProgram(null);
        // Optionally trigger refresh or rely on hook's realtime update
        // The useRegistrations hook should update the list automatically if successful
     };

     const handleCancelRegistration = async (programId: string, programTitle: string) => {
         const registrationId = registrationMap.get(programId);
         if (!registrationId) {
             console.error("Cannot find registration ID to cancel.");
              toast({ variant: 'destructive', title: 'Error', description: 'Could not find registration to cancel.' });
             return;
         }
         setIsCancelling(registrationId);
         try {
            await cancelRegistration(registrationId);
             toast({ title: 'Registration Cancelled', description: `Registration for "${programTitle}" cancelled.` });
            // Hook should update the registration list, triggering re-render
         } catch (error) {
              console.error("Failed to cancel registration:", error);
              toast({ variant: 'destructive', title: 'Error', description: 'Could not cancel registration.' });
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
                 <Skeleton className="h-12 w-full" />
             </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-24" />
            </CardFooter>
        </Card>
    );

    if (programsLoading || regsLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderSkeleton()}
                {renderSkeleton()}
                {renderSkeleton()}
            </div>
        );
    }

     if (programsError || regsError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Data</AlertTitle>
                <AlertDescription>
                     {programsError?.message || regsError?.message || 'Failed to load training program data.'}
                </AlertDescription>
            </Alert>
        );
    }

     if (!programsLoading && upcomingPrograms.length === 0) {
        return (
            <Card className="shadow-md text-center col-span-full"> {/* Ensure it spans across columns if in grid */}
                 <CardHeader>
                    <CardTitle>No Upcoming Training Programs</CardTitle>
                    <GraduationCap className="mx-auto h-16 w-16 text-muted-foreground my-4" />
                 </CardHeader>
                 <CardContent>
                    <p className="text-muted-foreground">There are currently no scheduled training sessions. Check back later!</p>
                 </CardContent>
             </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingPrograms.map((program) => {
                const isRegistered = registeredProgramIds.has(program.id);
                 const registrationId = registrationMap.get(program.id); // Get registration ID if registered
                 const isThisCancelling = isCancelling === registrationId;
                 const isDeadlinePassed = program.registrationDeadline ? program.registrationDeadline < Date.now() : false;
                 const canRegister = !isRegistered && !isDeadlinePassed;
                 const canCancel = isRegistered && !isDeadlinePassed; // Can only cancel if registered and before deadline

                return (
                    <Card key={program.id} className="shadow-md flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle>{program.title}</CardTitle>
                             <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                                <p className="flex items-center"><Calendar className="h-4 w-4 mr-1.5" /> {format(new Date(program.date), "PPP")}</p>
                                <p className="flex items-center"><MapPin className="h-4 w-4 mr-1.5" /> {program.location}</p>
                                 {program.registrationDeadline && (
                                    <p className={`flex items-center ${isDeadlinePassed ? 'text-destructive' : ''}`}>
                                        <Clock className="h-4 w-4 mr-1.5" />
                                        Deadline: {format(new Date(program.registrationDeadline), "PPP")} {isDeadlinePassed ? '(Passed)' : ''}
                                    </p>
                                )}
                             </div>
                        </CardHeader>
                         <CardContent>
                             <p className="text-sm text-foreground line-clamp-3">{program.description}</p> {/* Limit description lines */}
                         </CardContent>
                         <CardFooter className="flex justify-between items-center">
                             {isRegistered ? (
                                 <div className="flex items-center text-green-600 font-medium text-sm">
                                     <CheckCircle className="h-4 w-4 mr-1.5" /> Registered
                                 </div>
                             ) : (
                                 <div className="text-sm text-muted-foreground">{isDeadlinePassed ? 'Registration Closed' : 'Not Registered'}</div>
                             )}

                              {canRegister && (
                                <Dialog open={isFormOpen && selectedProgram?.id === program.id} onOpenChange={(open) => { if (!open) handleFormClose(); else handleOpenRegisterForm(program); }}>
                                    <DialogTrigger asChild>
                                         <Button size="sm" onClick={() => handleOpenRegisterForm(program)}>Register Now</Button>
                                    </DialogTrigger>
                                     <DialogContent className="sm:max-w-[425px]">
                                         <DialogHeader>
                                            <DialogTitle>Register for: {program.title}</DialogTitle>
                                            <p className="text-sm text-muted-foreground pt-1">Please provide your details below.</p>
                                         </DialogHeader>
                                        {selectedProgram && <RegisterTrainingForm program={selectedProgram} onClose={handleFormClose} />}
                                    </DialogContent>
                                </Dialog>
                             )}
                              {canCancel && (
                                 <AlertDialog>
                                     <AlertDialogTrigger asChild>
                                        <Button
                                             variant="outline"
                                             size="sm"
                                             disabled={isThisCancelling}
                                             className="text-destructive border-destructive hover:bg-destructive/10"
                                         >
                                             {isThisCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4"/>}
                                             Cancel Registration
                                         </Button>
                                     </AlertDialogTrigger>
                                     <AlertDialogContent>
                                         <AlertDialogHeader>
                                             <AlertDialogTitle>Cancel Registration?</AlertDialogTitle>
                                             <AlertDialogDescription>
                                                 This will remove your registration for "{program.title}". Are you sure?
                                             </AlertDialogDescription>
                                         </AlertDialogHeader>
                                         <AlertDialogFooter>
                                             <AlertDialogCancel disabled={isThisCancelling}>Back</AlertDialogCancel>
                                             <AlertDialogAction
                                                 onClick={() => handleCancelRegistration(program.id, program.title)}
                                                 disabled={isThisCancelling}
                                                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                             >
                                                 {isThisCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                                             </AlertDialogAction>
                                         </AlertDialogFooter>
                                     </AlertDialogContent>
                                 </AlertDialog>
                              )}
                              {/* Show disabled registered button if deadline passed */}
                              {isRegistered && isDeadlinePassed && (
                                <Button size="sm" disabled variant="ghost" className="text-muted-foreground">Registered (Deadline Passed)</Button>
                              )}

                         </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}
