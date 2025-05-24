// src/app/somya/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SomyaJhaPage() {
  return (
    <div className="container mx-auto py-12 px-4 min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <Card className="w-full max-w-2xl text-center shadow-xl">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-primary">Somya Jha</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground">
            Personal portfolio page. Content to be designed later.
          </p>
          <div className="mt-8">
            <img 
              src="https://placehold.co/300x300.png?text=Somya+Jha" 
              alt="Somya Jha" 
              className="rounded-full mx-auto shadow-lg"
              data-ai-hint="professional headshot"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
