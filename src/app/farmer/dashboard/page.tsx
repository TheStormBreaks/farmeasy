import type { Metadata } from 'next';
import ExistingAnnouncements from '@/components/ExistingAnnouncements';
import { Wheat } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard | Farmer Portal',
  description: 'View announcements from KVK.',
};

export default function FarmerDashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Wheat className="h-8 w-8 mr-3 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
      </div>
      <p className="mb-6 text-muted-foreground">
        Latest updates and information from KVK.
      </p>
      <ExistingAnnouncements />
    </div>
  );
}
