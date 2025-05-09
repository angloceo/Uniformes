
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PackagePlus, Search, Shirt, Zap, Layers, Wind, GripVertical } from "lucide-react";
import { initialUniforms, type Uniform, type UniformSize } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LucideIcon } from "lucide-react";

const garmentIcons: Record<Uniform['category'], LucideIcon> = {
  'Camiseta Polo': Shirt,
  'Camiseta Deporte': Zap,
  'Sudadera': Shirt, // Using Shirt as placeholder, consider custom SVG or different icon if available
  'Falda': Layers,
  'Chaqueta': Wind,
};

const getGarmentIcon = (category: Uniform['category']): React.ReactElement => {
  const IconComponent = garmentIcons[category] || GripVertical; // Fallback icon
  return <IconComponent className="h-6 w-6 text-primary" />;
};

const ALL_CATEGORIES_VALUE = "--all--";

export default function InventoryPage() {
  const [uniforms, setUniforms] = useState<Uniform[]>(initialUniforms); // Use initialUniforms directly
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_VALUE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Data is now directly from initialUniforms, so no async loading needed for it
    setLoading(false);
  }, []);

  const availableCategories = useMemo(() => {
    const categories = new Set(uniforms.map(u => u.category));
    return Array.from(categories);
  }, [uniforms]);


  const getStockStatus = (stock: number, lowStockThreshold: number): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    if (stock === 0) return { label: "Agotado", variant: "destructive" };
    if (stock <= lowStockThreshold) return { label: "Bajo Stock", variant: "destructive" }; // Kept destructive for low stock
    if (stock <= lowStockThreshold * 2) return { label: "Medio", variant: "outline" }; 
    return { label: "Suficiente", variant: "default" }; 
  };

  const filteredUniforms = uniforms.flatMap(uniform =>
    uniform.sizes.map(size => ({
      ...uniform, // Spread uniform properties (id, name, category, imageUrl)
      ...size,    // Spread size properties (size, price, cost, stock, lowStockThreshold)
      uniformName: uniform.name, 
      sizeSpecificId: `${uniform.id}-${size.size}`
    }))
  ).filter(item => {
    const searchTermMatch = item.uniformName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.size.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === ALL_CATEGORIES_VALUE ? true : item.category === selectedCategory;
    return searchTermMatch && categoryMatch;
  });

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
              <PackagePlus className="mr-2 h-4 w-4" /> Ingresar Nuevo Stock
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre, talla..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px] shadow hover:shadow-md">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES_VALUE}>Todas las categorías</SelectItem>
                {availableCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] text-center hidden sm:table-cell">Ícono</TableHead>
                  <TableHead>Prenda</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Talla</TableHead>
                  <TableHead className="text-right">Precio Venta</TableHead>
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
                        <TableCell className="hidden sm:table-cell text-center">
                          {getGarmentIcon(item.category)}
                        </TableCell>
                        <TableCell className="font-medium">{item.uniformName}</TableCell>
                        <TableCell className="text-muted-foreground">{item.category}</TableCell>
                        <TableCell>{item.size}</TableCell>
                        <TableCell className="text-right">COP {item.price.toLocaleString('es-CO')}</TableCell>
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

