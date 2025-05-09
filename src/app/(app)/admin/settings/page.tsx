
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { initialUniforms, type Uniform } from '@/lib/mock-data';
import { Settings2, Save, AlertCircle, Edit3, Image as ImageIcon, ShoppingBag } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [uniformTypes, setUniformTypes] = useState<Uniform[]>([]);
  const [editedUniformTypes, setEditedUniformTypes] = useState<Uniform[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const storedUniformsRaw = localStorage.getItem('updatedUniformsData');
      let liveUniformsData: Uniform[];
      if (storedUniformsRaw) {
        try {
          const parsedData = JSON.parse(storedUniformsRaw);
          if (Array.isArray(parsedData) && parsedData.every(item => typeof item.id === 'string' && typeof item.name === 'string' && typeof item.category === 'string' && Array.isArray(item.sizes))) {
            liveUniformsData = parsedData;
          } else {
            console.warn("Stored 'updatedUniformsData' has invalid format, falling back to initialUniforms.");
            liveUniformsData = JSON.parse(JSON.stringify(initialUniforms)); // Deep copy
            localStorage.setItem('updatedUniformsData', JSON.stringify(liveUniformsData));
          }
        } catch (error) {
          console.error("Error parsing 'updatedUniformsData' from localStorage:", error);
          liveUniformsData = JSON.parse(JSON.stringify(initialUniforms)); // Deep copy
          localStorage.setItem('updatedUniformsData', JSON.stringify(liveUniformsData));
        }
      } else {
        liveUniformsData = JSON.parse(JSON.stringify(initialUniforms)); // Deep copy
        localStorage.setItem('updatedUniformsData', JSON.stringify(liveUniformsData));
      }
      setUniformTypes(liveUniformsData);
      setEditedUniformTypes(JSON.parse(JSON.stringify(liveUniformsData))); // Deep copy for editing
      setLoading(false);
    }
  }, [mounted]);

  const handleInputChange = (id: string, field: 'name' | 'category', value: string) => {
    setEditedUniformTypes(currentTypes =>
      currentTypes.map(uniType =>
        uniType.id === id ? { ...uniType, [field]: value } : uniType
      )
    );
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    if (!editedUniformTypes.every(uni => uni.name.trim() !== "" && uni.category.trim() !== "")) {
      toast({
        title: "Error de Validación",
        description: "El nombre y la categoría de la prenda no pueden estar vacíos.",
        variant: "destructive",
      });
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('updatedUniformsData', JSON.stringify(editedUniformTypes));
    }
    setUniformTypes(JSON.parse(JSON.stringify(editedUniformTypes))); // Update main state with saved changes

    toast({
      title: "Cambios Guardados",
      description: "Los tipos de prendas han sido actualizados.",
    });
    setHasChanges(false);
  };

  if (!mounted || loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <CardHeader className="px-0">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-1/2 mt-2" />
        </CardHeader>
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Skeleton className="h-10 w-36" />
          </CardFooter>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold tracking-tight flex items-center">
          <Settings2 className="mr-3 h-8 w-8 text-primary" />
          Configuraciones Generales
        </CardTitle>
        <CardDescription>Gestión de configuraciones y datos maestros del sistema.</CardDescription>
      </CardHeader>

      {hasChanges && (
        <Card className="border-primary bg-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-primary mr-2" />
              <p className="text-sm text-primary-dark font-medium">
                Tienes cambios sin guardar. Haz clic en "Guardar Cambios" para aplicarlos.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Edit3 className="mr-2 h-5 w-5 text-primary" />
            Administrar Tipos de Prenda
          </CardTitle>
          <CardDescription>
            Edita el nombre y la categoría de las prendas. La categoría influye en el ícono mostrado en el inventario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-3">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-1/4">ID Prenda</TableHead>
                  <TableHead>Nombre Actual</TableHead>
                  <TableHead>Nuevo Nombre</TableHead>
                  <TableHead>Categoría Actual</TableHead>
                  <TableHead>Nueva Categoría (Ícono)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editedUniformTypes.map((uniType, index) => {
                  const originalType = uniformTypes.find(u => u.id === uniType.id) || uniType;
                  return (
                    <TableRow key={uniType.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{uniType.id}</TableCell>
                      <TableCell className="text-muted-foreground">{originalType.name}</TableCell>
                      <TableCell>
                        <Input
                          value={uniType.name}
                          onChange={(e) => handleInputChange(uniType.id, 'name', e.target.value)}
                          placeholder="Nombre de la prenda"
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{originalType.category}</TableCell>
                      <TableCell>
                        <Input
                          value={uniType.category}
                          onChange={(e) => handleInputChange(uniType.id, 'category', e.target.value)}
                          placeholder="Categoría (ej: Camiseta Polo)"
                          className="w-full"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveChanges} disabled={!hasChanges} className="shadow hover:shadow-md">
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios en Prendas
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl flex items-center">
                <ImageIcon className="mr-2 h-5 w-5 text-primary" />
                Gestión de Imágenes y Logo
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-muted-foreground">
                Esta sección permitirá gestionar las imágenes de los productos y el logo de la aplicación.
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4 text-sm">
                <li>Administrar imágenes asociadas a cada tipo de prenda.</li>
                <li>Actualizar el logo principal de la aplicación {siteConfig.name}.</li>
            </ul>
            <div className="pt-2 text-center">
                <Button variant="outline" className="mt-4" disabled>
                    Administrar Imágenes (Próximamente)
                </Button>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}

