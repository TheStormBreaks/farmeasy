// src/components/CyberHertzNavbar.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'; // Added SheetHeader, SheetTitle
import { Menu, Sun, Moon, Briefcase } from 'lucide-react'; 
import { useTheme } from "next-themes";
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'About CH', href: '/' },
  { label: 'Somya Jha', href: '/somya' },
  { label: 'FarmEasy', href: '/farmeasy' }, 
];

export default function CyberHertzNavbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Briefcase className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground">CyberHertz</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 items-center">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="mr-2">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[260px] bg-background p-6"> {/* Ensure SheetContent has padding */}
              <SheetHeader className="mb-6 text-left"> {/* Added text-left for title alignment */}
                <SheetTitle asChild>
                  <Link href="/" className="flex items-center gap-2">
                    <Briefcase className="h-7 w-7 text-primary" />
                    <span className="text-xl font-bold text-foreground">CyberHertz</span>
                  </Link>
                </SheetTitle>
                {/* You could add a <SheetDescription>Mobile Navigation</SheetDescription> here if desired */}
              </SheetHeader>
              <div className="flex flex-col gap-4"> {/* Links list */}
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "text-md font-medium transition-colors hover:text-primary",
                       pathname === item.href ? "text-primary" : "text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
