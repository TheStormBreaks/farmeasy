
// src/app/farmer/training/page.tsx
import type { Metadata } from 'next';
import ViewTrainingProgramsFarmer from '@/components/ViewTrainingProgramsFarmer'; // Create this component
import { GraduationCap, History } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ViewMyRegistrations from '@/components/ViewMyRegistrations';

export const metadata: Metadata = {
    title: 'Training Programs | Farmer Portal',
    description: 'View and register for upcoming training programs offered by KVK.',
};

export default function FarmerTrainingPage() {
    return (
        <div className="container mx-auto py-8 space-y-10">
            {/* Available Programs Section */}
             <div>
                 <div className="flex items-center mb-6">
                     <GraduationCap className="h-8 w-8 mr-3 text-primary" />
                     <h1 className="text-3xl font-bold text-foreground">Available Training Programs</h1>
                </div>
                <p className="mb-8 text-muted-foreground">
                    Browse upcoming training sessions and register to enhance your skills.
                </p>
                <ViewTrainingProgramsFarmer />
            </div>

            <Separator />

             {/* My Registrations Section */}
            <div>
                 <div className="flex items-center mb-6">
                    <History className="h-8 w-8 mr-3 text-secondary-foreground" />
                    <h1 className="text-3xl font-bold text-foreground">Your Registered Programs</h1>
                 </div>
                 <p className="mb-8 text-muted-foreground">
                    Review the training programs you have registered for.
                 </p>
                 <ViewMyRegistrations /> {/* Component to show farmer's registrations */}
             </div>
        </div>
    );
}

