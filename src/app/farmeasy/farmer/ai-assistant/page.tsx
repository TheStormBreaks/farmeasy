// src/app/farmeasy/farmer/ai-assistant/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Image as ImageIcon, Mic, Send, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { farmerAssistantFlow } from '@/ai/flows/farmer-assistant-flow';
import type { LanguageCode } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Extend window for SpeechRecognition
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    image?: string;
}

export default function AiAssistantPage() {
    const { toast } = useToast();
    const { language } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const speechRecognitionRef = useRef<any>(null);

    // Effect to initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            speechRecognitionRef.current = new SpeechRecognition();
            speechRecognitionRef.current.continuous = false;
            speechRecognitionRef.current.interimResults = false;
            speechRecognitionRef.current.lang = language === 'kn' ? 'kn-IN' : 'en-US';

            speechRecognitionRef.current.onstart = () => setIsListening(true);
            speechRecognitionRef.current.onend = () => setIsListening(false);
            speechRecognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                toast({ variant: 'destructive', title: 'Voice Error', description: `Could not recognize voice: ${event.error}` });
                setIsListening(false);
            };
            speechRecognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                // Automatically submit after voice input
                handleSubmit(transcript);
            };
        } else {
             console.warn("Speech Recognition not supported in this browser.");
        }
    }, [language]); // Re-initialize if language changes


    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                toast({ title: 'Image Selected', description: 'Image is ready to be sent with your next message.' });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMicClick = () => {
        if (!speechRecognitionRef.current) {
            toast({ variant: 'destructive', title: 'Not Supported', description: 'Voice input is not supported in this browser.' });
            return;
        }
        if (isListening) {
            speechRecognitionRef.current.stop();
        } else {
            speechRecognitionRef.current.start();
        }
    };
    
    const handleSubmit = async (text: string) => {
        const currentInput = text.trim();
        if (!currentInput && !image) return;

        setIsLoading(true);
        const userMessage: Message = { role: 'user', content: currentInput, ...(image && { image }) };
        setMessages(prev => [...prev, userMessage]);

        // Clear inputs after sending
        setInput('');
        setImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        try {
            const result = await farmerAssistantFlow({
                question: currentInput,
                photoDataUri: image,
                language: language,
            });

            const assistantMessage: Message = { role: 'assistant', content: result };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("AI flow error:", error);
            const errorMessage: Message = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
            toast({ variant: 'destructive', title: 'AI Error', description: 'Could not get a response from the assistant.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="container mx-auto max-w-4xl h-[calc(100vh-6rem)] flex flex-col p-0">
             <Card className="flex-1 flex flex-col shadow-xl">
                 <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2"><Bot className="h-6 w-6 text-primary"/> AI Farming Assistant</CardTitle>
                    <CardDescription>Your personal guide for crop diagnosis, farming advice, and more. Try asking in Kannada!</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.length === 0 && (
                         <div className="text-center text-muted-foreground mt-10">
                            <Bot size={48} className="mx-auto mb-4"/>
                            <p>No messages yet. Ask a question, upload an image, or use your voice to start.</p>
                        </div>
                    )}
                    {messages.map((message, index) => (
                        <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                             {message.role === 'assistant' && <Bot className="h-8 w-8 text-primary flex-shrink-0"/>}
                            <div className={`rounded-lg p-3 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                 {message.image && (
                                     <img src={message.image} alt="User upload" className="rounded-md mb-2 max-w-xs" />
                                 )}
                                <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                             {message.role === 'user' && <User className="h-8 w-8 text-muted-foreground flex-shrink-0"/>}
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex items-start gap-3">
                            <Bot className="h-8 w-8 text-primary flex-shrink-0"/>
                            <div className="rounded-lg p-3 bg-muted flex items-center space-x-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Thinking...</span>
                            </div>
                        </div>
                    )}
                </CardContent>
                 <div className="border-t p-4 bg-background">
                     {image && (
                        <div className="mb-2 flex items-center gap-2">
                             <Badge variant="secondary">
                                 <ImageIcon className="h-4 w-4 mr-1"/> Image Selected
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setImage(null)}>
                                 <X className="h-4 w-4" />
                            </Button>
                        </div>
                     )}
                     <div className="relative">
                         <Textarea
                            placeholder="Type your question or use the microphone..."
                            className="pr-24 min-h-[60px]"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(input);
                                }
                            }}
                            disabled={isLoading}
                        />
                         <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-1">
                             <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden"/>
                             <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading} title="Upload Image">
                                 <ImageIcon className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleMicClick} disabled={isLoading} className={isListening ? 'text-destructive' : ''} title="Use Voice">
                                 <Mic className="h-5 w-5"/>
                            </Button>
                             <Button size="icon" onClick={() => handleSubmit(input)} disabled={isLoading || (!input.trim() && !image)}>
                                 <Send className="h-5 w-5"/>
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
