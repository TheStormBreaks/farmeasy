// src/app/farmer/ask-query/page.tsx
import type { Metadata } from 'next';
import AskQueryForm from '@/components/AskQueryForm';
import MyQueriesDisplay from '@/components/MyQueriesDisplay'; // Import the new component
import { HelpCircle, History } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
    title: 'Ask KVK & View Queries | Farmer Portal',
    description: 'Submit your questions to KVK experts and view your past queries.',
};

export default function AskQueryPage() {
    return (
        <div className="container mx-auto py-8 space-y-10">
            {/* Ask Query Section */}
            <div>
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

            <Separator />

            {/* My Queries Section */}
            <div>
                 <div className="flex items-center mb-6">
                     <History className="h-8 w-8 mr-3 text-secondary-foreground" />
                     <h1 className="text-3xl font-bold text-foreground">Your Query History</h1>
                </div>
                 <p className="mb-6 text-muted-foreground">
                    Review the status and answers to your previously submitted questions.
                 </p>
                <MyQueriesDisplay /> {/* Add the component to display farmer's queries */}
            </div>
        </div>
    );
}
