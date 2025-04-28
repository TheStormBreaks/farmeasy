
// src/components/ManageTrainingPrograms.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import TrainingProgramForm from '@/components/TrainingProgramForm'; // Create this
import ViewTrainingProgramsKVK from '@/components/ViewTrainingProgramsKVK'; // Create this
import { PlusCircle } from 'lucide-react';
import type { TrainingProgram } from '@/types';

export default function ManageTrainingPrograms() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null);

    const handleOpenAddForm = () => {
        setEditingProgram(null); // Ensure not editing when adding
        setIsFormOpen(true);
    };

     const handleOpenEditForm = (program: TrainingProgram) => {
        setEditingProgram(program);
        setIsFormOpen(true);
    };

    const handleFormClose = (success?: boolean) => {
        setIsFormOpen(false);
        // Optionally refresh list if success is true, though hook should handle it
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-end">
                 <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleOpenAddForm}>
                             <PlusCircle className="mr-2 h-4 w-4" /> Create New Training Program
                         </Button>
                    </DialogTrigger>
                     <DialogContent className="sm:max-w-[625px]"> {/* Wider dialog */}
                        <DialogHeader>
                             <DialogTitle>{editingProgram ? 'Edit Training Program' : 'Create New Training Program'}</DialogTitle>
                        </DialogHeader>
                         <TrainingProgramForm
                             programToEdit={editingProgram}
                             onClose={handleFormClose}
                         />
                         {/* Footer might be inside the form */}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Component to display list of existing programs and their registrations */}
            <ViewTrainingProgramsKVK onEdit={handleOpenEditForm} />
        </div>
    );
}
