
// src/app/kvk/training/page.tsx
import type { Metadata } from 'next';
import ManageTrainingPrograms from '@/components/ManageTrainingPrograms'; // Create this component
import { GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Manage Training Programs | KVK Portal',
    description: 'Create, view, and manage training programs and registrations.',
};

export default function KVKTrainingPage() {
    return (
        <div className="container mx-auto py-8">
             <div className="flex items-center mb-6">
                <GraduationCap className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">Training Program Management</h1>
            </div>
            <p className="mb-8 text-muted-foreground">
               Create new training sessions, update existing ones, and view farmer registrations.
            </p>
            <ManageTrainingPrograms />
        </div>
    );
}

