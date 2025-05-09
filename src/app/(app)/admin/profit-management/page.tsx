
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { initialUniforms, type Uniform, type UniformSize } from '@/lib/mock-data';
import { DollarSign, TrendingUp, Save, AlertCircle, Info, Filter } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Make initialUniforms mutable for this page (in a real app, this would be API calls)
let mutableUniforms: Uniform[] = JSON.parse(JSON.stringify(initialUniforms));

const ALL_CATEGORIES_VALUE = "--all--";

export default function ProfitManagementPage() {
  const { toast } = useToast();
  const [uniforms, setUniforms] = useState<Uniform[]>(mutableUniforms);
  const [originalUniforms, setOriginalUniforms] = useState<Uniform[]>(JSON.parse(JSON.stringify(initialUniforms)));
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_VALUE);

  const availableCategories = useMemo(() => {
    const categories = new Set(initialUniforms.map(u => u.category));
    return Array.from(categories);
  }, []);


  const handleInputChange = (uniformId: string, sizeValue: string, field: 'price' | 'cost', value: string) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) && value !== '') return; 

    setUniforms(currentUniforms =>
      currentUniforms.map(uni => {
        if (uni.id === uniformId) {
          return {
            ...uni,
            sizes: uni.sizes.map(s => {
              if (s.size === sizeValue) {
                return { ...s, [field]: value === '' ? 0 : numericValue };
              }
              return s;
            }),
          };
        }
        return uni;
      })
    );
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    let isValid = true;
    uniforms.forEach(uni => {
      uni.sizes.forEach(s => {
        if (s.cost > s.price) {
          toast({
            title: "Error de Validación",
            description: `El costo de ${uni.name} (Talla: ${s.size}) no puede ser mayor que el precio.`,
            variant: "destructive",
          });
          isValid = false;
        }
      });
    });

    if (!isValid) return;

    mutableUniforms = JSON.parse(JSON.stringify(uniforms));
    // Update localStorage so other pages see the changes
    if (typeof window !== 'undefined') {
        localStorage.setItem('updatedUniformsData', JSON.stringify(mutableUniforms));
    }
    setOriginalUniforms(JSON.parse(JSON.stringify(mutableUniforms))); // Update original state after save
    console.log("Datos guardados y localStorage actualizado:", mutableUniforms);
    toast({
      title: "Cambios Guardados",
      description: "Los costos y precios han sido actualizados.",
    });
    setHasChanges(false);
  };
  
  const filteredUniformsForDisplay = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES_VALUE) {
      return uniforms;
    }
    return uniforms.filter(uni => uni.category === selectedCategory);
  }, [uniforms, selectedCategory]);

  const overallPotentialProfitData = useMemo(() => {
    let totalPotentialProfit = 0;
    let totalStockValueAtCost = 0;
    let totalStockValueAtSale = 0;

    uniforms.forEach(uni => { 
      uni.sizes.forEach(s => {
        if (s.stock > 0) {
          const profitPerUnit = s.price - s.cost;
          totalPotentialProfit += profitPerUnit * s.stock;
          totalStockValueAtCost += s.cost * s.stock;
          totalStockValueAtSale += s.price * s.stock;
        }
      });
    });
    return { totalPotentialProfit, totalStockValueAtCost, totalStockValueAtSale };
  }, [uniforms]);

  const categorySpecificPotentialProfitData = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES_VALUE) {
      return { totalPotentialProfit: 0, totalStockValueAtCost: 0, totalStockValueAtSale: 0, category: null };
    }
    let totalPotentialProfit = 0;
    let totalStockValueAtCost = 0;
    let totalStockValueAtSale = 0;

    filteredUniformsForDisplay.forEach(uni => {
      uni.sizes.forEach(s => {
        if (s.stock > 0) {
          const profitPerUnit = s.price - s.cost;
          totalPotentialProfit += profitPerUnit * s.stock;
          totalStockValueAtCost += s.cost * s.stock;
          totalStockValueAtSale += s.price * s.stock;
        }
      });
    });
    return { totalPotentialProfit, totalStockValueAtCost, totalStockValueAtSale, category: selectedCategory };
  }, [filteredUniformsForDisplay, selectedCategory]);


  return (
    <div className="space-y-8">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold tracking-tight flex items-center">
          <DollarSign className="mr-3 h-8 w-8 text-primary" />
          Gestión de Costos, Precios y Ganancias
        </CardTitle>
        <CardDescription>
          Define los costos y precios de venta de las prendas para calcular la rentabilidad.
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

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl">Editar Costos y Precios de Venta</CardTitle>
              <CardDescription>
                Modifica los valores y haz clic en "Guardar Cambios". Los precios están en COP.
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto sm:min-w-[200px]">
               <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="shadow hover:shadow-md">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
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
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Prenda</TableHead>
                  <TableHead>Talla</TableHead>
                  <TableHead className="text-right">Precio Venta Actual</TableHead>
                  <TableHead className="text-right">Nuevo Precio Venta</TableHead>
                  <TableHead className="text-right">Costo Actual</TableHead>
                  <TableHead className="text-right">Nuevo Costo</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUniformsForDisplay.length > 0 ? (
                  filteredUniformsForDisplay.map(uni =>
                    uni.sizes.map(s => (
                      <TableRow key={`${uni.id}-${s.size}`}>
                        <TableCell className="font-medium">{uni.name}</TableCell>
                        <TableCell>{s.size}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {originalUniforms.find(ou => ou.id === uni.id)?.sizes.find(os => os.size === s.size)?.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }) || 'N/A'}
                        </TableCell>
                         <TableCell className="text-right">
                          <Input
                            type="number"
                            value={s.price}
                            onChange={(e) => handleInputChange(uni.id, s.size, 'price', e.target.value)}
                            className="w-32 text-right tabular-nums"
                            placeholder="Precio"
                            min="0"
                          />
                        </TableCell>
                         <TableCell className="text-right text-muted-foreground">
                          {originalUniforms.find(ou => ou.id === uni.id)?.sizes.find(os => os.size === s.size)?.cost.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }) || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={s.cost}
                            onChange={(e) => handleInputChange(uni.id, s.size, 'cost', e.target.value)}
                            className="w-32 text-right tabular-nums"
                            placeholder="Costo"
                            min="0"
                          />
                        </TableCell>
                        <TableCell className="text-right">{s.stock}</TableCell>
                      </TableRow>
                    ))
                  )
                ) : (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No hay prendas en la categoría seleccionada o la tabla está vacía.
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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            Reporte de Ganancia Potencial
          </CardTitle>
          <CardDescription>
            Estimación de ganancias basada en el inventario actual y los precios/costos definidos en la tabla de edición.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedCategory !== ALL_CATEGORIES_VALUE && categorySpecificPotentialProfitData.category && (
            <div className="space-y-3 p-4 border rounded-md bg-muted/50 shadow">
              <h3 className="text-lg font-semibold text-foreground">
                Detalle para Categoría: <span className="text-primary">{categorySpecificPotentialProfitData.category}</span>
              </h3>
              <div className="flex justify-between items-center p-3 bg-background rounded-md shadow-sm">
                <span className="font-medium text-foreground">Valor Stock (al costo) - Categoría:</span>
                <span className="font-semibold text-md text-foreground">
                  {categorySpecificPotentialProfitData.totalStockValueAtCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-md shadow-sm">
                <span className="font-medium text-foreground">Valor Stock (a la venta) - Categoría:</span>
                <span className="font-semibold text-md text-foreground">
                  {categorySpecificPotentialProfitData.totalStockValueAtSale.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-md border border-primary/50">
                <span className="font-medium text-primary-dark">Ganancia Potencial - Categoría:</span>
                <span className="font-bold text-lg text-primary">
                  {categorySpecificPotentialProfitData.totalPotentialProfit.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {selectedCategory !== ALL_CATEGORIES_VALUE && <Separator className="my-4" />}
            <h3 className="text-lg font-semibold text-foreground pt-2">
              Totales Generales (Todas las Prendas)
            </h3>
            <div className="flex justify-between items-center p-3 bg-muted rounded-md">
              <span className="font-medium text-foreground">Valor Total del Stock (al costo):</span>
              <span className="font-semibold text-lg text-foreground">
                {overallPotentialProfitData.totalStockValueAtCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-md">
              <span className="font-medium text-foreground">Valor Total del Stock (a la venta):</span>
              <span className="font-semibold text-lg text-foreground">
                {overallPotentialProfitData.totalStockValueAtSale.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-primary/10 rounded-md border border-primary">
              <span className="font-medium text-primary-dark">Ganancia Potencial Total General:</span>
              <span className="font-bold text-xl text-primary">
                {overallPotentialProfitData.totalPotentialProfit.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>
          
          <div className="pt-4 text-xs text-muted-foreground flex items-start">
            <Info size={16} className="mr-1.5 mt-0.5 shrink-0" />
            <span>
              Este reporte es una estimación y no considera ventas pasadas ni otros costos operativos.
              La ganancia se calcula como (Precio de Venta - Costo) * Stock Actual para cada ítem.
              Los precios y costos utilizados para este cálculo son los que se muestran actualmente en la tabla de edición, independientemente de si han sido guardados.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

