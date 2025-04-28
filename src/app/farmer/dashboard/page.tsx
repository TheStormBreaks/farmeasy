// src/app/farmer/dashboard/page.tsx
import type { Metadata } from 'next';
import ExistingAnnouncements from '@/components/ExistingAnnouncements';
import DisplayAdvisory from '@/components/DisplayAdvisory'; // Import the component to display advisory
import { Separator } from '@/components/ui/separator';
import { Wheat, Megaphone, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard | Farmer Portal',
  description: 'View announcements and advisories from KVK.',
};

export default function FarmerDashboardPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Advisory Section */}
      <div>
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-7 w-7 mr-3 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">Crop & Weather Advisory</h1>
          </div>
          <DisplayAdvisory />
      </div>

      <Separator />

      {/* Announcements Section */}
      <div>
          <div className="flex items-center mb-4">
            <Megaphone className="h-7 w-7 mr-3 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">General Announcements</h1>
          </div>
          <p className="mb-6 text-muted-foreground">
            Latest updates and information from KVK.
          </p>
          <ExistingAnnouncements />
       </div>
    </div>
  );
}
