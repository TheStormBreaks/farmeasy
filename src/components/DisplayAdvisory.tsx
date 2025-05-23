
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

const ADVISORY_DOC_ID = 'current_advisory';
const ADVISORY_COLLECTION = 'advisories';

interface PdfInfo {
  url: string;
  text: string;
}

export default function DisplayAdvisory() {
    const [kvkAdvisory, setKvkAdvisory] = useState<{ text: string; lastUpdated: number | null } | null>(null);
    const [isLoadingKvk, setIsLoadingKvk] = useState(true);
    const [errorKvk, setErrorKvk] = useState<Error | null>(null);

    const [weatherPdfs, setWeatherPdfs] = useState<PdfInfo[]>([]);
    const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
    const [isLoadingPdfs, setIsLoadingPdfs] = useState(true);
    const [errorPdfs, setErrorPdfs] = useState<Error | null>(null);
    const [isEmbeddingPdf, setIsEmbeddingPdf] = useState(false);

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

    const handleSelectPdf = (url: string) => {
        setIsEmbeddingPdf(true);
        setSelectedPdfUrl(url);
        // The iframe will start loading. We set isEmbeddingPdf to false on iframe load or error.
    };

    const handleIframeLoad = () => {
        setIsEmbeddingPdf(false);
    };
    
    const handleIframeError = () => {
        setIsEmbeddingPdf(false);
        // Optionally show a toast or message that embedding failed
        console.warn("Failed to embed PDF, possibly due to X-Frame-Options or CSP.");
    };


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
                    <AlertTriangle className="h-5 w-5 mr-2 text-destructive" /> KVK Advisory
                </h2>
                {isLoadingKvk &&  <Skeleton className="h-20 w-full rounded-md" />}
                {!isLoadingKvk && errorKvk && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>Could not load the KVK advisory. Please try again later.</AlertDescription>
                    </Alert>
                )}
                {!isLoadingKvk && !errorKvk && (!kvkAdvisory || !kvkAdvisory.text) && (
                    <Alert variant="default" className='border-primary bg-primary/5'>
                        <Info className="h-4 w-4 text-primary" />
                        <AlertTitle className='text-primary'>No Active KVK Advisory</AlertTitle>
                        <AlertDescription>There is currently no active crop or weather advisory manually posted by KVK.</AlertDescription>
                    </Alert>
                )}
                {!isLoadingKvk && !errorKvk && kvkAdvisory && kvkAdvisory.text && (
                    <Card className="shadow-md border-l-4 border-destructive bg-destructive/5">
                        <CardContent className="p-6">
                            <p className="text-foreground whitespace-pre-wrap">{kvkAdvisory.text}</p>
                            {kvkAdvisory.lastUpdated && (
                                <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-destructive/20">
                                    Last updated: {format(new Date(kvkAdvisory.lastUpdated), "PPPp")}
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
                    <CloudLightning className="h-5 w-5 mr-2 text-blue-500" /> External Weather Bulletins
                </h2>
                {isLoadingPdfs && <Skeleton className="h-40 w-full rounded-md" />}
                {!isLoadingPdfs && errorPdfs && (
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error Loading Bulletins</AlertTitle>
                        <AlertDescription>{errorPdfs.message}</AlertDescription>
                    </Alert>
                )}
                {!isLoadingPdfs && !errorPdfs && weatherPdfs.length === 0 && (
                     <Alert variant="default" className='border-blue-500 bg-blue-500/5'>
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertTitle className='text-blue-600'>No Bulletins Found</AlertTitle>
                        <AlertDescription>Could not automatically fetch weather bulletins from the external source.</AlertDescription>
                    </Alert>
                )}
                {!isLoadingPdfs && !errorPdfs && weatherPdfs.length > 0 && (
                    <div className="space-y-4">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">Available PDF Bulletins:</CardTitle>
                                <CardDescription>Select a bulletin to view or open externally. Showing top {weatherPdfs.slice(0, 3).length} bulletins found.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {weatherPdfs.slice(0, 3).map((pdf, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-md hover:bg-muted/50 gap-2">
                                        <div className="flex items-center space-x-2 flex-grow min-w-0">
                                            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <span className="text-sm text-foreground truncate" title={pdf.text}>{pdf.text}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 flex-shrink-0 mt-2 sm:mt-0">
                                            <Button variant="outline" size="sm" onClick={() => handleSelectPdf(pdf.url)} disabled={isEmbeddingPdf && selectedPdfUrl === pdf.url}>
                                                {isEmbeddingPdf && selectedPdfUrl === pdf.url ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                                                View Inline
                                            </Button>
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={pdf.url} target="_blank" rel="noopener noreferrer" title={`Open ${pdf.text} in new tab`}>
                                                    <ExternalLink className="h-4 w-4 mr-1" /> Open
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {selectedPdfUrl && (
                            <Card className="shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-base">Viewing: {weatherPdfs.find(p=>p.url === selectedPdfUrl)?.text || 'Selected PDF'}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isEmbeddingPdf && <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Loading PDF...</p></div>}
                                    <iframe
                                        src={selectedPdfUrl}
                                        title="Weather PDF Viewer"
                                        className={`w-full h-[700px] border rounded-md ${isEmbeddingPdf ? 'hidden' : 'block'}`} // Hide while loading custom indicator
                                        onLoad={handleIframeLoad}
                                        onError={handleIframeError}
                                    >
                                        <p className="p-4 text-center text-muted-foreground">
                                            Your browser does not support iframes or the PDF could not be embedded.
                                            You can <a href={selectedPdfUrl} target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">download it here</a>.
                                        </p>
                                    </iframe>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
