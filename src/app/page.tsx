// src/app/page.tsx (New CyberHertz Homepage)
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Briefcase, Settings, Handshake, Mail } from 'lucide-react';
import Image from 'next/image';

export default function CyberHertzHomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero/Banner Section */}
      <section className="relative w-full h-[70vh] bg-gradient-to-r from-primary/80 via-primary/60 to-secondary/60 flex items-center justify-center text-center p-4">
        <Image
          src="https://placehold.co/1920x1080.png?text=CyberHertz+Banner"
          alt="CyberHertz Banner Background"
          layout="fill"
          objectFit="cover"
          className="absolute z-0 opacity-30"
          data-ai-hint="technology abstract"
        />
        <div className="z-10 space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground shadow-lg">
            CyberHertz
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
            Driving Innovation, Delivering Excellence. Your trusted partner in technology solutions.
          </p>
          <Button size="lg" variant="secondary" className="mt-4">
            Learn More
          </Button>
        </div>
      </section>

      {/* Industries Covered Section */}
      <section id="industries" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Industries We Serve
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {['Finance', 'Healthcare', 'Education', 'E-commerce'].map((industry) => (
              <Card key={industry} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <Briefcase className="h-12 w-12 mx-auto text-primary mb-4" />
                  <CardTitle className="text-xl font-semibold">{industry}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Tailored solutions for the {industry.toLowerCase()} sector.</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services We Offer Section */}
      <section id="services" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Custom Software Development', desc: 'Building scalable and robust software solutions.' },
              { title: 'Cloud Solutions', desc: 'Leveraging cloud platforms for efficiency and growth.' },
              { title: 'AI & Machine Learning', desc: 'Implementing intelligent systems to solve complex problems.' },
            ].map((service) => (
              <Card key={service.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <Settings className="h-10 w-10 text-primary mb-3" />
                  <CardTitle className="text-xl font-semibold">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Employees Working With Us Section (Placeholder) */}
      <section id="team" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="text-center p-6 shadow-lg">
                <Image 
                  src={`https://placehold.co/200x200.png?text=Employee+${i}`} 
                  alt={`Employee ${i}`} 
                  width={120} 
                  height={120} 
                  className="rounded-full mx-auto mb-4"
                  data-ai-hint="professional portrait"
                />
                <h3 className="text-lg font-semibold text-foreground">Employee Name {i}</h3>
                <p className="text-sm text-primary">Job Title</p>
                <p className="text-xs text-muted-foreground mt-2">Expert in something amazing.</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Logos Section (Placeholder) */}
      <section id="partners" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Our Valued Partners
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[1, 2, 3, 4, 5].map((i) => (
              <Image 
                key={i} 
                src={`https://placehold.co/150x80.png?text=Partner+${i}`} 
                alt={`Partner Logo ${i}`} 
                width={150} 
                height={80}
                className="opacity-70 hover:opacity-100 transition-opacity"
                data-ai-hint="company logo"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Section (Placeholder) */}
      <section id="contact" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Get In Touch
          </h2>
          <Card className="max-w-2xl mx-auto p-6 md:p-8 shadow-xl">
            <CardHeader>
              <CardTitle className="text-center">Contact Us</CardTitle>
              <CardDescription className="text-center">
                We'd love to hear from you! Reach out with any questions or project inquiries.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:info@cyberhertz.in" className="text-primary hover:underline">
                  info@cyberhertz.in
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                Or fill out our contact form (form functionality not implemented in this prototype).
              </p>
              {/* Placeholder for a form */}
              <div className="space-y-2 mt-4">
                <div className="h-10 bg-muted rounded-md animate-pulse"></div>
                <div className="h-24 bg-muted rounded-md animate-pulse"></div>
                <div className="h-10 bg-primary/50 rounded-md w-1/3 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer for CyberHertz */}
       <footer className="py-8 bg-foreground text-background">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} CyberHertz. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
