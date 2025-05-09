
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { initialUniforms, type Uniform, type UniformSize } from '@/lib/mock-data';
import { DollarSign, TrendingUp, Save, AlertCircle, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Make initialUniforms mutable for this page (in a real app, this would be API calls)
let mutableUniforms: Uniform[] = JSON.parse(JSON.stringify(initialUniforms));

export default function ProfitManagementPage() {
  const { toast } = useToast();
  const [uniforms, setUniforms] = useState<Uniform[]>(mutableUniforms);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (uniformId: string, sizeValue: string, field: 'price' | 'cost', value: string) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) && value !== '') return; // Allow empty input for clearing

    setUniforms(currentUniforms =>
      currentUniforms.map(uni => {
        if (uni.id === uniformId) {
          return {
            ...uni,
            sizes: uni.sizes.map(s => {
              if (s.size === sizeValue) {
                return { ...s, [field]: value === '' ? 0 : numericValue }; // Store 0 if empty
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
    // Validate data before saving (e.g., cost < price)
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

    // In a real app, this would be an API call.
    // For this demo, we update the mutable "database".
    mutableUniforms = JSON.parse(JSON.stringify(uniforms)); 
    console.log("Datos guardados:", mutableUniforms);
    toast({
      title: "Cambios Guardados",
      description: "Los costos y precios han sido actualizados.",
    });
    setHasChanges(false);
  };
  
  const potentialProfitData = useMemo(() => {
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
          <CardTitle className="text-xl">Editar Costos y Precios de Venta</CardTitle>
          <CardDescription>
            Modifica los valores y haz clic en "Guardar Cambios". Los precios están en COP.
          </CardDescription>
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
                {uniforms.map(uni =>
                  uni.sizes.map(s => (
                    <TableRow key={`${uni.id}-${s.size}`}>
                      <TableCell className="font-medium">{uni.name}</TableCell>
                      <TableCell>{s.size}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {initialUniforms.find(iu => iu.id === uni.id)?.sizes.find(is => is.size === s.size)?.price.toLocaleString('es-CO') || 'N/A'}
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
                        {initialUniforms.find(iu => iu.id === uni.id)?.sizes.find(is => is.size === s.size)?.cost.toLocaleString('es-CO') || 'N/A'}
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
            Reporte de Ganancia Potencial (Stock Actual)
          </CardTitle>
          <CardDescription>
            Estimación de ganancias basada en el inventario actual y los precios definidos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
           <div className="flex justify-between items-center p-3 bg-muted rounded-md">
            <span className="font-medium text-foreground">Valor Total del Stock (al costo):</span>
            <span className="font-semibold text-lg text-foreground">
              COP {potentialProfitData.totalStockValueAtCost.toLocaleString('es-CO')}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-md">
            <span className="font-medium text-foreground">Valor Total del Stock (a la venta):</span>
            <span className="font-semibold text-lg text-foreground">
              COP {potentialProfitData.totalStockValueAtSale.toLocaleString('es-CO')}
            </span>
          </div>
           <div className="flex justify-between items-center p-4 bg-primary/10 rounded-md border border-primary">
            <span className="font-medium text-primary-dark">Ganancia Potencial Total:</span>
            <span className="font-bold text-xl text-primary">
              COP {potentialProfitData.totalPotentialProfit.toLocaleString('es-CO')}
            </span>
          </div>
           <div className="pt-2 text-xs text-muted-foreground flex items-start">
            <Info size={14} className="mr-1.5 mt-0.5 shrink-0" />
            <span>
              Este reporte es una estimación y no considera ventas pasadas ni otros costos operativos.
              La ganancia se calcula como (Precio de Venta - Costo) * Stock Actual para cada ítem.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
