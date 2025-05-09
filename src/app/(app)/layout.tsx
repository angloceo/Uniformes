"use client";
import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarHeader } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/SidebarNav";
import { AppLogo } from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { siteConfig } from '@/config/site';

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('userRole');
    if (!role) {
      router.push('/login');
    } else {
      setUserRole(role);
    }
  }, [router]);

  const handleLogout = () => {
    if (mounted) {
      localStorage.removeItem('userRole');
    }
    router.push('/login');
  };

  if (!mounted || !userRole) {
    // You can show a loading spinner or a blank page while checking auth
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
            <SidebarTrigger className="md:hidden" /> {/* Only show trigger on mobile */}
            <h1 className="text-lg font-semibold text-foreground hidden md:block">{siteConfig.name} Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground capitalize">
              {userRole || "Usuario"}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Cerrar sesión">
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
