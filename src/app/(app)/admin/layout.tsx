
"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase'; // Import Firebase auth
import { onAuthStateChanged } from 'firebase/auth';

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
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // Role is expected to be in localStorage, set after successful login and Firestore fetch
          const role = localStorage.getItem('userRole');
          if (role === 'admin') {
            setIsAdmin(true);
          } else {
            // If not admin, or role not found, redirect
            router.push('/dashboard'); 
          }
        } else {
          // No user logged in, redirect to login
          router.push('/login');
        }
        setLoading(false);
      });
      return () => unsubscribe();
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
    // This case handles if the user is not an admin after checks.
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
