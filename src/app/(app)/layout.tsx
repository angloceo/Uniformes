
"use client";
import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/SidebarNav";
import { AppLogo } from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { siteConfig } from '@/config/site';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loggedInUsername, setLoggedInUsername] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('userRole');
    const username = localStorage.getItem('loggedInUser');
    if (!role) {
      router.push('/login');
    } else {
      setUserRole(role);
      setLoggedInUsername(username);
    }
  }, [router]);

  const handleLogout = () => {
    if (mounted) {
      localStorage.removeItem('userRole');
      localStorage.removeItem('loggedInUser');
    }
    router.push('/login');
  };

  if (!mounted || !userRole) {
    return <div className="flex items-center justify-center min-h-screen bg-background">Cargando...</div>;
  }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarNav />
      </Sidebar>
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden h-8 w-8" /> {/* Only show trigger on mobile */}
             <div className="hidden md:block">
               <AppLogo iconClassName="h-7 w-7" textClassName="text-lg" />
             </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground capitalize hidden sm:inline-block">
              {loggedInUsername || userRole || "Usuario"}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Cerrar sesión" className="h-8 w-8">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/40">
          {children}
        </main>
        <footer className="border-t bg-background px-4 py-3 text-center text-xs text-muted-foreground md:px-6">
          &copy; {new Date().getFullYear()} {siteConfig.name} - Colegio Anglo Español.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
