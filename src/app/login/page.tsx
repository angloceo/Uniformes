
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

interface AppUser {
  id: string;
  username: string;
  password_plaintext: string;
  role: 'admin' | 'secretary';
}

const defaultAdminUser: AppUser = {
  id: `user-${Date.now()}-admin`,
  username: 'admin',
  password_plaintext: 'admin123',
  role: 'admin'
};

const defaultSecretaryUser: AppUser = {
  id: `user-${Date.now()}-secretary`,
  username: 'secretary',
  password_plaintext: 'secretary123',
  role: 'secretary'
};

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const storedUsersRaw = localStorage.getItem('appUsersData');
      if (storedUsersRaw) {
        try {
          const parsedUsers = JSON.parse(storedUsersRaw);
          if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
            setAppUsers(parsedUsers);
          } else {
            // Initialize with defaults if empty or invalid
            const defaultUsers = [defaultAdminUser, defaultSecretaryUser];
            localStorage.setItem('appUsersData', JSON.stringify(defaultUsers));
            setAppUsers(defaultUsers);
          }
        } catch (error) {
          console.error("Error parsing appUsersData from localStorage:", error);
          const defaultUsers = [defaultAdminUser, defaultSecretaryUser];
          localStorage.setItem('appUsersData', JSON.stringify(defaultUsers));
          setAppUsers(defaultUsers);
        }
      } else {
        // Initialize with defaults if not present
        const defaultUsers = [defaultAdminUser, defaultSecretaryUser];
        localStorage.setItem('appUsersData', JSON.stringify(defaultUsers));
        setAppUsers(defaultUsers);
      }
    }
  }, []);

  const handleLoginAttempt = (event: FormEvent) => {
    event.preventDefault();
    if (!mounted) return;

    const user = appUsers.find(
      (u) => u.username === username && u.password_plaintext === password
    );

    if (user) {
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('loggedInUser', user.username); // Store username for display
      toast({
        title: "Inicio de Sesión Exitoso",
        description: `Bienvenido ${user.username}. Redirigiendo...`,
      });
      router.push('/dashboard');
    } else {
      toast({
        title: "Error de Autenticación",
        description: "Nombre de usuario o contraseña incorrectos.",
        variant: "destructive",
      });
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
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="usuario" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
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
              />
            </div>
            
            <Button type="submit" className="w-full">
              Iniciar Sesión
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
