
// src/app/kvk/announcements/page.tsx
'use client'; // Required for hooks like useLanguage

import React, { useEffect } from 'react'; // Import useEffect
import type { Metadata } from 'next';
import AnnouncementForm from '@/components/AnnouncementForm';
import ExistingAnnouncements from '@/components/ExistingAnnouncements';
import CropWeatherAdvisory from '@/components/CropWeatherAdvisory';
import { Separator } from '@/components/ui/separator';
import { CloudSun, Megaphone, Settings } from 'lucide-react'; // Changed icon for page title
import { useLanguage } from '@/context/LanguageContext'; // Import useLanguage
import { db } from '@/lib/firebase'; // Import db
import { collection, getDocs, query, limit } from 'firebase/firestore'; // Import Firestore functions

// export const metadata: Metadata = {
//     title: 'Manage Announcements & Advisories | KVK Portal',
//     description: 'Create announcements and update crop/weather advisories for farmers.',
// };

export default function KVKAnnouncementsPage() {
    const { t } = useLanguage();

    // If you need dynamic metadata title (document.title):
    // React.useEffect(() => {
    //   document.title = t('KVKAnnouncementsPage.metadata_title');
    // }, [t]);

    useEffect(() => {
        const testFirestoreRead = async () => {
            if (!db) {
                console.error("KVKAnnouncementsPage Firestore Test: db instance is not available.");
                return;
            }
            console.log("KVKAnnouncementsPage Firestore Test: Attempting a simple read...");
            try {
                const q = query(collection(db, "announcements"), limit(1));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    console.log("KVKAnnouncementsPage Firestore Test: Read successful, 'announcements' collection is empty or test query found no docs.");
                } else {
                    querySnapshot.forEach((doc) => {
                        console.log("KVKAnnouncementsPage Firestore Test: Read successful, found doc:", doc.id, "=>", doc.data());
                    });
                }
            } catch (error) {
                console.error("KVKAnnouncementsPage Firestore Test: Error during simple read:", error);
                if (error instanceof Error) {
                     console.error("KVKAnnouncementsPage Firestore Test: Error name:", error.name);
                     console.error("KVKAnnouncementsPage Firestore Test: Error message:", error.message);
                     if ((error as any).code) {
                        console.error("KVKAnnouncementsPage Firestore Test: Error code:", (error as any).code);
                     }
                }
            }
        };
        if (process.env.NODE_ENV === 'development') { // Run test only in development
            testFirestoreRead();
        }
    }, []);


    return (
        <div className="container mx-auto py-8">
             <div className="flex items-center mb-8"> {/* Increased bottom margin */}
                <Settings className="h-8 w-8 mr-3 text-primary" /> {/* Changed Icon and color */}
                <h1 className="text-3xl font-bold text-foreground">{t('KVKAnnouncementsPage.page_title')}</h1>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Left Column: Announcements */}
                <div className="space-y-6">
                     <div className="flex items-center mb-4">
                         <Megaphone className="h-6 w-6 mr-3 text-secondary-foreground"/>
                        <h2 className="text-2xl font-semibold text-foreground">{t('KVKAnnouncementsPage.general_announcements_title')}</h2>
                    </div>
                    <AnnouncementForm />
                     <ExistingAnnouncements />
                </div>

                 {/* Right Column: Crop & Weather Advisory */}
                 <div className="space-y-6">
                    <div className="flex items-center mb-4">
                         <CloudSun className="h-6 w-6 mr-3 text-blue-500"/>
                         <h2 className="text-2xl font-semibold text-foreground">{t('KVKAnnouncementsPage.crop_weather_advisory_title')}</h2>
                    </div>
                    <CropWeatherAdvisory />
                 </div>
            </div>
        </div>
    );
}
