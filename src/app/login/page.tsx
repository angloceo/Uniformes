
"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLogo } from '@/components/AppLogo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { siteConfig } from '@/config/site'; // Import siteConfig

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  const handleLogin = (role: 'admin' | 'secretary') => {
    // In a real app, you'd authenticate here
    // For now, just simulate login and store role
    if (mounted) {
      localStorage.setItem('userRole', role);
    }
    router.push('/dashboard');
  };

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen bg-background">Loading...</div>; // Or a proper skeleton loader
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 w-fit">
            <AppLogo 
              showColegioLogo={true} 
              iconClassName="h-16 w-16" 
              textClassName="text-2xl"
              subTextClassName="text-sm"
            />
          </div>
          <CardTitle className="text-2xl">Iniciar Sesión en {siteConfig.name}</CardTitle>
          <CardDescription>Accede al panel de gestión de uniformes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" placeholder="usuario@colegio.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          <div className="space-y-3">
            <Button onClick={() => handleLogin('admin')} className="w-full" variant="default">
              Entrar como Administrador
            </Button>
            <Button onClick={() => handleLogin('secretary')} className="w-full" variant="secondary">
              Entrar como Secretaria
            </Button>
          </div>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {siteConfig.name} - Colegio Anglo Español. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
