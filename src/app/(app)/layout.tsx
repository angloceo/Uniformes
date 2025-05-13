
"use client";
import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/SidebarNav";
import { AppLogo } from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle } from "lucide-react"; // Added UserCircle
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { siteConfig } from '@/config/site';
import { ThemeToggle } from '@/components/ThemeToggle';
import { auth } from '@/lib/firebase'; // Import Firebase auth
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loggedInUsername, setLoggedInUsername] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const roleFromStorage = localStorage.getItem('userRole');
        const usernameFromStorage = localStorage.getItem('loggedInUser');
        // It's important that role and username are set correctly in localStorage upon login after fetching from Firestore
        if (roleFromStorage) {
          setUserRole(roleFromStorage);
          setLoggedInUsername(usernameFromStorage || user.displayName || user.email || "Usuario");
        } else {
          // If role isn't in storage, this indicates an issue (e.g., user logged in but Firestore data fetch failed previously)
          // For robustness, you might want to re-fetch from Firestore here or sign out.
          // For now, we'll assume it should be there or redirect.
          console.warn("User is authenticated but role not found in localStorage. This might indicate an issue.");
          router.push('/login'); 
        }
      } else {
        localStorage.removeItem('userRole');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('loggedInUserId');
        router.push('/login');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
      // localStorage items are cleared by onAuthStateChanged listener
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
      // Handle logout error (e.g., show a toast)
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-20 hidden sm:block" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>
        <div className="flex flex-1">
          <aside className="hidden md:block w-64 border-r p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </aside>
          <main className="flex-1 p-6">
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarNav />
      </Sidebar>
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden h-8 w-8" />
             <div className="hidden md:block">
               <AppLogo iconClassName="h-7 w-7" textClassName="text-lg" />
             </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {loggedInUsername ? (
              <span className="text-sm text-muted-foreground capitalize hidden sm:inline-block">
                {loggedInUsername}
              </span>
            ) : (
              <UserCircle className="h-6 w-6 text-muted-foreground hidden sm:inline-block" />
            )}
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
