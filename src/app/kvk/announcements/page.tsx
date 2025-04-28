import type { Metadata } from 'next';
import AnnouncementForm from '@/components/AnnouncementForm';
import ExistingAnnouncements from '@/components/ExistingAnnouncements';

export const metadata: Metadata = {
    title: 'Make Announcement | KVK Portal',
    description: 'Create and view announcements for farmers.',
};

export default function KVKAnnouncementsPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6 text-primary">Manage Announcements</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div>
                    <h2 className="text-2xl font-semibold mb-4 text-foreground">Create New Announcement</h2>
                    <AnnouncementForm />
                </div>
                <div>
                     <h2 className="text-2xl font-semibold mb-4 text-foreground">Posted Announcements</h2>
                     <ExistingAnnouncements />
                </div>
            </div>
        </div>
    );
}
