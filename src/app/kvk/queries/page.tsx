// src/app/kvk/queries/page.tsx
import type { Metadata } from 'next';
import ViewQueries from '@/components/ViewQueries'; // Create this component
import { ClipboardList } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Farmer Queries | KVK Portal',
    description: 'View and manage questions submitted by farmers.',
};

export default function KVKQueriesPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center mb-6">
                <ClipboardList className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">Farmer Queries</h1>
             </div>
             <p className="mb-6 text-muted-foreground">
                Review questions submitted by farmers and provide answers.
             </p>
             <ViewQueries />
        </div>
    );
}
