
"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Button } from '@/components/ui/button'; // Import Button component

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const role = localStorage.getItem('userRole');
      if (role === 'admin') {
        setIsAdmin(true);
      } else {
        // Redirect non-admins or unauthenticated users
        router.push('/dashboard'); 
      }
      setLoading(false);
    }
  }, [router, mounted]);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    // This case is mainly a fallback if redirection is slow or fails.
    // The user should have been redirected by the useEffect.
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h1 className="text-2xl font-bold text-destructive">Acceso Denegado</h1>
            <p className="text-muted-foreground">No tienes permiso para ver esta página.</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Volver al Dashboard
            </Button>
      </div>
    );
  }

  return <>{children}</>;
}

