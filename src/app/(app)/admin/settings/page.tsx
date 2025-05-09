
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, ShieldCheck, Image as ImageIcon, ShoppingBag, Settings2 } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold tracking-tight flex items-center">
          <ShieldCheck className="mr-3 h-8 w-8 text-primary" />
          Configuraciones Generales
        </CardTitle>
        <CardDescription>Gestión de configuraciones y datos maestros del sistema.</CardDescription>
      </CardHeader>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl flex items-center"><Construction className="mr-2 h-5 w-5 text-primary" /> Módulo en Construcción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Este módulo permitirá la personalización y gestión de varios aspectos de la aplicación.
            Las funcionalidades planeadas incluyen:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
            <li><ImageIcon className="inline-block mr-2 h-4 w-4" /> Gestión de imágenes de productos.</li>
            <li><ShoppingBag className="inline-block mr-2 h-4 w-4" /> Administración del logo de la aplicación.</li>
            <li><Settings2 className="inline-block mr-2 h-4 w-4" /> Configuración de tipos de prendas y otras opciones generales.</li>
          </ul>
          <div className="pt-4 text-center">
            <Button variant="outline" className="mt-6" disabled>
                Explorar Configuraciones (Próximamente)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
