
"use client";

import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from "@/hooks/use-toast";
import { initialUniforms, type Uniform, type UniformSize } from '@/lib/mock-data';
import { TrendingUp, Save, Filter, AlertCircle, DollarSign, Archive, BarChartBig } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ALL_CATEGORIES_VALUE = "--all--";

interface Totals {
  totalCostOfStock: number;
  totalPotentialSalesValue: number;
  totalPotentialProfit: number;
}

export default function ProfitManagementPage() {
  const { toast } = useToast();
  const [uniformsData, setUniformsData] = useState<Uniform[]>([]);
  const [editableUniformsData, setEditableUniformsData] = useState<Uniform[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_VALUE);
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
          liveUniformsData = JSON.parse(storedUniformsRaw);
        } catch (error) {
          console.error("Error parsing 'updatedUniformsData' from localStorage:", error);
          liveUniformsData = JSON.parse(JSON.stringify(initialUniforms));
          localStorage.setItem('updatedUniformsData', JSON.stringify(liveUniformsData));
        }
      } else {
        liveUniformsData = JSON.parse(JSON.stringify(initialUniforms));
        localStorage.setItem('updatedUniformsData', JSON.stringify(liveUniformsData));
      }
      setUniformsData(liveUniformsData);
      setEditableUniformsData(JSON.parse(JSON.stringify(liveUniformsData)));
      setLoading(false);
    }
  }, [mounted]);

  const availableCategories = useMemo(() => {
    const categories = new Set(uniformsData.map(u => u.category));
    return Array.from(categories);
  }, [uniformsData]);

  const handleInputChange = (uniformId: string, sizeValue: string, field: 'cost' | 'price', value: string) => {
    const numericValue = parseFloat(value);
    if (value !== '' && (isNaN(numericValue) || numericValue < 0)) {
      toast({
        title: "Valor Inválido",
        description: "El costo y el precio deben ser números positivos.",
        variant: "destructive",
      });
      return;
    }

    setEditableUniformsData(currentUniforms =>
      currentUniforms.map(uni => {
        if (uni.id === uniformId) {
          return {
            ...uni,
            sizes: uni.sizes.map(s => {
              if (s.size === sizeValue) {
                return { ...s, [field]: value === '' ? 0 : numericValue };
              }
              return s;
            })
          };
        }
        return uni;
      })
    );
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    if (!editableUniformsData.every(uni => uni.sizes.every(s => s.cost >= 0 && s.price >= 0))) {
        toast({
          title: "Error de Validación",
          description: "El costo y el precio de las prendas no pueden ser negativos.",
          variant: "destructive",
        });
        return;
      }

    localStorage.setItem('updatedUniformsData', JSON.stringify(editableUniformsData));
    setUniformsData(JSON.parse(JSON.stringify(editableUniformsData)));
    toast({
      title: "Cambios Guardados",
      description: "Los costos y precios de las prendas han sido actualizados.",
    });
    setHasChanges(false);
  };

  const calculateTotals = (itemsToCalculate: Uniform[]): Totals => {
    let totalCostOfStock = 0;
    let totalPotentialSalesValue = 0;
    let totalPotentialProfit = 0;

    itemsToCalculate.forEach(uni => {
      uni.sizes.forEach(s => {
        totalCostOfStock += s.cost * s.stock;
        totalPotentialSalesValue += s.price * s.stock;
        totalPotentialProfit += (s.price - s.cost) * s.stock;
      });
    });
    return { totalCostOfStock, totalPotentialSalesValue, totalPotentialProfit };
  };

  const filteredEditableUniforms = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES_VALUE) {
      return editableUniformsData;
    }
    return editableUniformsData.filter(uni => uni.category === selectedCategory);
  }, [editableUniformsData, selectedCategory]);

  const categoryTotals = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES_VALUE) return null;
    const itemsForCategory = editableUniformsData.filter(uni => uni.category === selectedCategory);
    return calculateTotals(itemsForCategory);
  }, [editableUniformsData, selectedCategory]);

  const overallTotals = useMemo(() => {
    return calculateTotals(editableUniformsData);
  }, [editableUniformsData]);

  const formatCurrency = (value: number) => `COP ${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  if (!mounted || loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-1/2 mt-2" />
        <Card className="shadow-lg">
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent><Skeleton className="h-40 w-full" /></CardContent>
        </Card>
         <Card className="shadow-lg">
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent><Skeleton className="h-20 w-full" /></CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  const renderTotalsCard = (title: string, totals: Totals | null, icon: ReactNode) => {
    if (!totals) return null;
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Costo Total del Stock:</span>
            <span className="font-semibold">{formatCurrency(totals.totalCostOfStock)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valor Potencial de Venta del Stock:</span>
            <span className="font-semibold">{formatCurrency(totals.totalPotentialSalesValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ganancia Potencial del Stock:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(totals.totalPotentialProfit)}</span>
          </div>
        </CardContent>
      </Card>
    );
  };


  return (
    <div className="space-y-8">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold tracking-tight flex items-center">
          <TrendingUp className="mr-3 h-8 w-8 text-primary" />
          Gestión de Costos y Ganancias
        </CardTitle>
        <CardDescription>
          Edita los costos y precios de venta de las prendas para analizar la rentabilidad.
        </CardDescription>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoryTotals && renderTotalsCard(`Totales para: ${selectedCategory}`, categoryTotals, <Filter className="mr-2 h-5 w-5 text-primary"/>)}
        {renderTotalsCard("Totales Generales del Inventario", overallTotals, <Archive className="mr-2 h-5 w-5 text-primary"/>)}
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Editar Costos y Precios</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 items-end pt-2">
            <div className="flex-grow sm:flex-grow-0 sm:w-1/3">
              <Label htmlFor="category-filter">Filtrar por Categoría</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category-filter" className="shadow-sm mt-1">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORIES_VALUE}>Todas las categorías</SelectItem>
                  {availableCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-3">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Prenda</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Talla</TableHead>
                  <TableHead className="w-[130px]">Costo (COP)</TableHead>
                  <TableHead className="w-[130px]">Precio Venta (COP)</TableHead>
                  <TableHead className="text-right">Ganancia Unitaria</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEditableUniforms.flatMap(uni =>
                  uni.sizes.map(s => {
                    const originalUniform = uniformsData.find(u => u.id === uni.id);
                    const originalSize = originalUniform?.sizes.find(os => os.size === s.size) || s;
                    const profitPerUnit = s.price - s.cost;
                    return (
                      <TableRow key={`${uni.id}-${s.size}`}>
                        <TableCell className="font-medium">{uni.name}</TableCell>
                        <TableCell className="text-muted-foreground">{uni.category}</TableCell>
                        <TableCell>{s.size}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={s.cost.toString()} // Ensure value is string for input
                            onChange={(e) => handleInputChange(uni.id, s.size, 'cost', e.target.value)}
                            placeholder="Costo"
                            className="w-full tabular-nums"
                            min="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={s.price.toString()} // Ensure value is string for input
                            onChange={(e) => handleInputChange(uni.id, s.size, 'price', e.target.value)}
                            placeholder="Precio"
                            className="w-full tabular-nums"
                            min="0"
                          />
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${profitPerUnit < 0 ? 'text-destructive' : 'text-green-600'}`}>
                          {formatCurrency(profitPerUnit)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{originalSize.stock}</TableCell>
                      </TableRow>
                    );
                  })
                )}
                {filteredEditableUniforms.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No hay prendas para mostrar con el filtro actual.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveChanges} disabled={!hasChanges} className="shadow hover:shadow-md">
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
