
// src/components/ViewRegistrations.tsx
'use client';

import React from 'react';
import { useRegistrations } from '@/hooks/useRegistrations';
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, User, Phone, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card'; // Use Card for better container

interface ViewRegistrationsProps {
    programId: string;
}

export default function ViewRegistrations({ programId }: ViewRegistrationsProps) {
    const { registrations, isLoading, error } = useRegistrations({ programId });

    const renderSkeleton = () => (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        </TableRow>
    );

    if (isLoading) {
        return (
             <Card className="border-dashed border-border bg-muted/30">
                 <CardContent className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Mobile</TableHead>
                                <TableHead>Registered On</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {renderSkeleton()}
                            {renderSkeleton()}
                        </TableBody>
                    </Table>
                 </CardContent>
             </Card>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Registrations</AlertTitle>
                <AlertDescription>
                    {error.message}
                </AlertDescription>
            </Alert>
        );
    }

    if (!isLoading && registrations.length === 0) {
        return (
             <Card className="border-dashed border-border bg-muted/30 text-center">
                 <CardContent className="p-6">
                     <p className="text-sm text-muted-foreground">No farmers have registered for this program yet.</p>
                 </CardContent>
             </Card>
        );
    }

    return (
         <Card className="border-border bg-muted/30">
            <CardContent className="p-0"> {/* Remove padding if table has its own */}
                <Table>
                    <TableCaption className="py-2 text-xs">List of registered farmers.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead><User className="inline h-4 w-4 mr-1" />Name</TableHead>
                            <TableHead><Phone className="inline h-4 w-4 mr-1" />Mobile</TableHead>
                            <TableHead><Clock className="inline h-4 w-4 mr-1" />Registered On</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {registrations.map((reg) => (
                            <TableRow key={reg.id}>
                                <TableCell className="font-medium">{reg.farmerName}</TableCell>
                                <TableCell>{reg.mobileNumber}</TableCell>
                                <TableCell className="text-xs">{format(new Date(reg.registrationTimestamp), "Pp")}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
         </Card>
    );
}
