"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PackagePlus, Search, Filter } from "lucide-react";
import { initialUniforms, type Uniform, type UniformSize } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';

export default function InventoryPage() {
  const [uniforms, setUniforms] = useState<Uniform[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setUniforms(initialUniforms);
    setLoading(false);
  }, []);

  const getStockStatus = (stock: number, lowStockThreshold: number): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    if (stock === 0) return { label: "Agotado", variant: "destructive" };
    if (stock <= lowStockThreshold) return { label: "Bajo Stock", variant: "destructive" }; // Using destructive for orange/red like warning
    if (stock <= lowStockThreshold * 2) return { label: "Medio", variant: "outline" }; // Outline for orange like warning
    return { label: "Suficiente", variant: "default" }; // Default for green like success
  };

  const filteredUniforms = uniforms.flatMap(uniform =>
    uniform.sizes.map(size => ({
      ...uniform,
      ...size,
      uniformName: uniform.name, // ensure uniform name is available for searching
      sizeSpecificId: `${uniform.id}-${size.size}`
    }))
  ).filter(item =>
    item.uniformName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.size.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold tracking-tight">Inventario de Uniformes</CardTitle>
          <CardDescription>Visualiza y gestiona el stock de uniformes.</CardDescription>
        </CardHeader>
        <div className="h-10 bg-muted rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded w-full animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-semibold">Inventario de Uniformes</CardTitle>
            <CardDescription>Visualiza y gestiona el stock de uniformes.</CardDescription>
          </div>
          <Link href="/inventory/add" passHref>
            <Button variant="default" className="shadow hover:shadow-md">
              <PackagePlus className="mr-2 h-4 w-4" /> Ingresar Nueva Prenda
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre, categoría, talla..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button variant="outline" className="shadow hover:shadow-md">
              <Filter className="mr-2 h-4 w-4" /> Filtros
            </Button>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] hidden sm:table-cell">Imagen</TableHead>
                  <TableHead>Prenda</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Talla</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUniforms.length > 0 ? (
                  filteredUniforms.map((item) => {
                    const status = getStockStatus(item.stock, item.lowStockThreshold);
                    return (
                      <TableRow key={item.sizeSpecificId} className="hover:bg-muted/50">
                        <TableCell className="hidden sm:table-cell">
                          {item.imageUrl && (
                            <Image
                              src={item.imageUrl}
                              alt={item.uniformName}
                              width={50}
                              height={50}
                              className="rounded-md object-cover aspect-square"
                              data-ai-hint="school uniform"
                            />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{item.uniformName}</TableCell>
                        <TableCell className="text-muted-foreground">{item.category}</TableCell>
                        <TableCell>{item.size}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">{item.stock}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={status.variant} className="shadow-sm">{status.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No se encontraron prendas con los criterios de búsqueda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
