
// src/components/DisplayAdvisory.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Info, FileText, ExternalLink, CloudLightning, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { fetchLatestWeatherPdfUrls } from '@/app/actions/fetch-weather-pdfs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext'; // Import useLanguage

const ADVISORY_DOC_ID = 'current_advisory';
const ADVISORY_COLLECTION = 'advisories';

interface PdfInfo {
  url: string;
  text: string;
}

export default function DisplayAdvisory() {
    const { t } = useLanguage(); // Use language context
    const [kvkAdvisory, setKvkAdvisory] = useState<{ text: string; lastUpdated: number | null } | null>(null);
    const [isLoadingKvk, setIsLoadingKvk] = useState(true);
    const [errorKvk, setErrorKvk] = useState<Error | null>(null);

    const [weatherPdfs, setWeatherPdfs] = useState<PdfInfo[]>([]);
    const [isLoadingPdfs, setIsLoadingPdfs] = useState(true);
    const [errorPdfs, setErrorPdfs] = useState<Error | null>(null);

    useEffect(() => {
        setIsLoadingKvk(true);
        const advisoryDocRef = doc(db, ADVISORY_COLLECTION, ADVISORY_DOC_ID);

        const unsubscribe = onSnapshot(advisoryDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const lastUpdatedMillis = data.lastUpdated instanceof Timestamp
                    ? data.lastUpdated.toMillis()
                    : typeof data.lastUpdated === 'number' ? data.lastUpdated : null;

                setKvkAdvisory({
                    text: data.text || '',
                    lastUpdated: lastUpdatedMillis,
                });
            } else {
                setKvkAdvisory(null);
            }
            setIsLoadingKvk(false);
        }, (err) => {
            console.error("Error fetching KVK advisory:", err);
            setErrorKvk(err instanceof Error ? err : new Error('Failed to fetch KVK advisory'));
            setIsLoadingKvk(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        async function loadPdfs() {
            setIsLoadingPdfs(true);
            setErrorPdfs(null);
            try {
                const pdfs = await fetchLatestWeatherPdfUrls();
                setWeatherPdfs(pdfs);
            } catch (err) {
                console.error("Error in loadPdfs effect:", err);
                setErrorPdfs(err instanceof Error ? err : new Error('Failed to load weather PDF links.'));
            } finally {
                setIsLoadingPdfs(false);
            }
        }
        loadPdfs();
    }, []);


    if (isLoadingKvk && isLoadingPdfs) {
        return (
            <div className="space-y-6">
                <Card className="shadow-md border-destructive bg-destructive/5">
                    <CardHeader> <Skeleton className="h-6 w-3/4" /> </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/3 mt-4" />
                    </CardContent>
                </Card>
                 <Card className="shadow-md">
                    <CardHeader> <Skeleton className="h-6 w-1/2" /> </CardHeader>
                    <CardContent> <Skeleton className="h-10 w-full" /> </CardContent>
                 </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* KVK Manually Entered Advisory */}
            <div>
                <h2 className="text-xl font-semibold mb-3 flex items-center text-primary">
                    <AlertTriangle className="h-5 w-5 mr-2 text-destructive" /> {t('DisplayAdvisory.kvkAdvisorySectionTitle')}
                </h2>
                {isLoadingKvk &&  <Skeleton className="h-20 w-full rounded-md" />}
                {!isLoadingKvk && errorKvk && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t('DisplayAdvisory.kvkAdvisoryErrorTitle')}</AlertTitle>
                        <AlertDescription>{t('DisplayAdvisory.kvkAdvisoryErrorDescription')}</AlertDescription>
                    </Alert>
                )}
                {!isLoadingKvk && !errorKvk && (!kvkAdvisory || !kvkAdvisory.text) && (
                    <Alert variant="default" className='border-primary bg-primary/5'>
                        <Info className="h-4 w-4 text-primary" />
                        <AlertTitle className='text-primary'>{t('DisplayAdvisory.noKvkAdvisoryTitle')}</AlertTitle>
                        <AlertDescription>{t('DisplayAdvisory.noKvkAdvisoryDescription')}</AlertDescription>
                    </Alert>
                )}
                {!isLoadingKvk && !errorKvk && kvkAdvisory && kvkAdvisory.text && (
                    <Card className="shadow-md border-l-4 border-destructive bg-destructive/5">
                        <CardContent className="p-6">
                            <p className="text-foreground whitespace-pre-wrap">{kvkAdvisory.text}</p>
                            {kvkAdvisory.lastUpdated && (
                                <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-destructive/20">
                                    {t('DisplayAdvisory.lastUpdatedPrefix')}: {format(new Date(kvkAdvisory.lastUpdated), "PPPp")}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            <Separator />

            {/* External Weather PDFs Section */}
            <div>
                 <h2 className="text-xl font-semibold mb-3 flex items-center text-primary">
                    <CloudLightning className="h-5 w-5 mr-2 text-blue-500" /> {t('DisplayAdvisory.externalBulletinsSectionTitle')}
                </h2>
                {isLoadingPdfs && <Skeleton className="h-40 w-full rounded-md" />}
                {!isLoadingPdfs && errorPdfs && (
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t('DisplayAdvisory.errorLoadingBulletinsTitle')}</AlertTitle>
                        <AlertDescription>{errorPdfs.message}</AlertDescription>
                    </Alert>
                )}
                {!isLoadingPdfs && !errorPdfs && weatherPdfs.length === 0 && (
                     <Alert variant="default" className='border-blue-500 bg-blue-500/5'>
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertTitle className='text-blue-600'>{t('DisplayAdvisory.noBulletinsFoundTitle')}</AlertTitle>
                        <AlertDescription>{t('DisplayAdvisory.noBulletinsFoundDescription')}</AlertDescription>
                    </Alert>
                )}
                {!isLoadingPdfs && !errorPdfs && weatherPdfs.length > 0 && (
                    <div className="space-y-4">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">{t('DisplayAdvisory.availablePdfBulletinsCardTitle')}</CardTitle>
                                <CardDescription>
                                    {t('DisplayAdvisory.availablePdfBulletinsCardDescription').replace('{count}', weatherPdfs.slice(0, 3).length.toString())}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {weatherPdfs.slice(0, 3).map((pdf, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-md hover:bg-muted/50 gap-2">
                                        <div className="flex items-center space-x-2 flex-grow min-w-0">
                                            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <span className="text-sm text-foreground truncate" title={pdf.text}>{pdf.text}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 flex-shrink-0 mt-2 sm:mt-0">
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={pdf.url} target="_blank" rel="noopener noreferrer" title={`${t('DisplayAdvisory.openButtonText')} ${pdf.text} ${t('DisplayAdvisory.inNewTabText') || 'in new tab'}`}>
                                                    <ExternalLink className="h-4 w-4 mr-1" /> {t('DisplayAdvisory.openButtonText')}
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

