// src/app/farmer/ask-query/page.tsx
import type { Metadata } from 'next';
import AskQueryForm from '@/components/AskQueryForm';
import { HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Ask KVK | Farmer Portal',
    description: 'Submit your questions and queries to KVK experts.',
};

export default function AskQueryPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center mb-6">
                 <HelpCircle className="h-8 w-8 mr-3 text-primary" />
                 <h1 className="text-3xl font-bold text-foreground">Ask KVK a Question</h1>
            </div>
             <p className="mb-6 text-muted-foreground">
                Have a question about farming practices, schemes, or need advice? Submit it here.
             </p>
             <div className="max-w-2xl mx-auto">
                <AskQueryForm />
             </div>
        </div>
    );
}
