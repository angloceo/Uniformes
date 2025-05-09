"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, ShieldCheck } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold tracking-tight flex items-center">
          <ShieldCheck className="mr-3 h-8 w-8 text-primary" />
          Módulo Administrativo
        </CardTitle>
        <CardDescription>Gestión de configuraciones y datos maestros del sistema.</CardDescription>
      </CardHeader>

      <Card className="shadow-lg">
        <CardContent className="pt-6 text-center">
          <Construction className="mx-auto h-16 w-16 text-primary mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Página en Construcción</h2>
          <p className="text-muted-foreground mt-2">
            Este módulo permitirá la gestión de imágenes de productos, el logo de la aplicación,
            tipos de prendas, y otras configuraciones generales del sistema.
          </p>
          <Button variant="outline" className="mt-6" disabled>
            Ver Configuraciones (Próximamente)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
