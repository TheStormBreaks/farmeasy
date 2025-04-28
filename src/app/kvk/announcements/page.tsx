// src/app/kvk/announcements/page.tsx
import type { Metadata } from 'next';
import AnnouncementForm from '@/components/AnnouncementForm';
import ExistingAnnouncements from '@/components/ExistingAnnouncements';
import CropWeatherAdvisory from '@/components/CropWeatherAdvisory'; // Import the new component
import { Separator } from '@/components/ui/separator';
import { CloudSun, Megaphone } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Manage Announcements & Advisories | KVK Portal',
    description: 'Create announcements and update crop/weather advisories for farmers.',
};

export default function KVKAnnouncementsPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8 text-primary">Manage Communications</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Left Column: Announcements */}
                <div className="space-y-6">
                     <div className="flex items-center mb-4">
                         <Megaphone className="h-6 w-6 mr-3 text-secondary-foreground"/>
                        <h2 className="text-2xl font-semibold text-foreground">General Announcements</h2>
                    </div>
                    <AnnouncementForm />
                     <ExistingAnnouncements />
                </div>

                 {/* Right Column: Crop & Weather Advisory */}
                 <div className="space-y-6">
                    <div className="flex items-center mb-4">
                         <CloudSun className="h-6 w-6 mr-3 text-blue-500"/>
                         <h2 className="text-2xl font-semibold text-foreground">Crop & Weather Advisory</h2>
                    </div>
                    <CropWeatherAdvisory />
                 </div>
            </div>
        </div>
    );
}
