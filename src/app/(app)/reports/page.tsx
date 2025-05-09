"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold tracking-tight">Reportes</CardTitle>
        <CardDescription>Visualiza informes de ventas e inventario.</CardDescription>
      </CardHeader>

      <Card className="shadow-lg">
        <CardContent className="pt-6 text-center">
          <Construction className="mx-auto h-16 w-16 text-primary mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Página de Reportes en Construcción</h2>
          <p className="text-muted-foreground mt-2">
            Esta sección estará disponible próximamente con filtros avanzados y gráficas detalladas.
          </p>
          <Button variant="outline" className="mt-6" disabled>
            Exportar Reporte (Próximamente)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
