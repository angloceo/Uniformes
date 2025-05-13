
"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLogo } from '@/components/AppLogo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect, type FormEvent } from 'react';
import { siteConfig } from '@/config/site';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase'; // Import Firebase auth and db
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        // Optionally fetch role here and redirect if already logged in and role is known
        // For now, simple redirect if user object exists
        // router.push('/dashboard'); 
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLoginAttempt = async (event: FormEvent) => {
    event.preventDefault();
    if (!mounted) return;
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('loggedInUser', userData.username || user.email || 'Usuario'); // Use username from Firestore if available
        localStorage.setItem('loggedInUserId', user.uid);
        
        toast({
          title: "Inicio de Sesión Exitoso",
          description: `Bienvenido ${userData.username || user.email}. Redirigiendo...`,
        });
        router.push('/dashboard');
      } else {
        // This case should ideally not happen if users are created correctly with a Firestore document
        toast({
          title: "Error de Autenticación",
          description: "No se encontró información adicional del usuario. Contacte al administrador.",
          variant: "destructive",
        });
        await auth.signOut(); // Sign out user as their data is incomplete
      }
    } catch (error: any) {
      console.error("Firebase login error:", error);
      let errorMessage = "Error de autenticación. Verifique sus credenciales.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Email o contraseña incorrectos.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "El formato del email es inválido.";
      }
      toast({
        title: "Error de Autenticación",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen bg-background">Cargando...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 w-fit">
            <AppLogo 
              showColegioLogoText={true} 
              iconClassName="h-16 w-16" 
              textClassName="text-2xl"
              subTextClassName="text-sm"
            />
          </div>
          <CardTitle className="text-2xl">Iniciar Sesión en {siteConfig.name}</CardTitle>
          <CardDescription>Accede al panel de gestión de uniformes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLoginAttempt} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label> {/* Changed from username to email */}
              <Input 
                id="email" 
                type="email" // Changed type to email
                placeholder="tu@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                autoComplete="current-password"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {siteConfig.name} - Colegio Anglo Español. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
