
"use client";

import { useState, useEffect, useMemo, type SVGProps } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PackagePlus, Search, Shirt, Zap, Layers, Wind, GripVertical, History } from "lucide-react"; // Added History
import { initialUniforms, type Uniform, type UniformSize } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LucideIcon } from "lucide-react";

// Custom SVG icon for Pants/Trousers
const PantsIconSvg = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    data-ai-hint="pants clothing"
    {...props}
  >
    <path d="M9 2v10H6l-2 8h4l2-6h4l2 6h4l-2-8h-3V2Z"/>
  </svg>
);

const garmentIcons: Record<Uniform['category'], React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'Camiseta Polo': Shirt,
  'Camiseta Deporte': Zap,
  'Sudadera': PantsIconSvg, 
  'Falda': Layers,
  'Chaqueta': Wind,
};

const getGarmentIcon = (category: Uniform['category']): React.ReactElement => {
  const IconComponent = garmentIcons[category] || GripVertical; 
  return <IconComponent className="h-6 w-6 text-primary" />;
};

const ALL_CATEGORIES_VALUE = "--all--";

export default function InventoryPage() {
  const [uniforms, setUniforms] = useState<Uniform[]>([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_VALUE);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const storedUniforms = localStorage.getItem('updatedUniformsData');
      const liveUniforms = storedUniforms ? JSON.parse(storedUniforms) : initialUniforms;
      setUniforms(liveUniforms);
      setLoading(false);
    }
  }, [mounted]);

  const availableCategories = useMemo(() => {
    const categories = new Set(uniforms.map(u => u.category));
    return Array.from(categories);
  }, [uniforms]);


  const getStockStatus = (stock: number, lowStockThreshold: number): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    if (stock === 0) return { label: "Agotado", variant: "destructive" };
    if (stock <= lowStockThreshold) return { label: "Bajo Stock", variant: "destructive" };
    if (stock <= lowStockThreshold * 2) return { label: "Medio", variant: "outline" }; 
    return { label: "Suficiente", variant: "default" }; 
  };

  const filteredUniforms = uniforms.flatMap(uniform =>
    uniform.sizes.map(size => ({
      ...uniform, 
      ...size,    
      uniformName: uniform.name, 
      sizeSpecificId: `${uniform.id}-${size.size}`
    }))
  ).filter(item => {
    const searchTermMatch = item.uniformName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.size.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === ALL_CATEGORIES_VALUE ? true : item.category === selectedCategory;
    return searchTermMatch && categoryMatch;
  });

  if (!mounted || loading) {
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
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/inventory/add" passHref>
              <Button variant="default" className="shadow hover:shadow-md w-full sm:w-auto">
                <PackagePlus className="mr-2 h-4 w-4" /> Ingresar Nuevo Stock
              </Button>
            </Link>
            <Link href="/inventory/history" passHref>
              <Button variant="outline" className="shadow hover:shadow-md w-full sm:w-auto">
                <History className="mr-2 h-4 w-4" /> Ver Historial de Ingresos
              </Button>
            </Link>
          </div>
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

