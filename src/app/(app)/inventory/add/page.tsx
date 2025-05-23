
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from "@/hooks/use-toast";
import { initialUniforms, type Uniform, type StockEntry, type StockEntryItemDetails } from '@/lib/mock-data';
import { ArrowLeft, PackagePlus, Save, Filter } from 'lucide-react';
import { auth } from '@/lib/firebase'; // Import Firebase auth

const ALL_CATEGORIES_VALUE = "--all--";

export default function AddStockPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [allUniforms, setAllUniforms] = useState<Uniform[]>([]);
  const [stockInputs, setStockInputs] = useState<Record<string, Record<string, string>>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_VALUE);
  const [entryDate, setEntryDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [entryNotes, setEntryNotes] = useState<string>('');
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUserUid(user.uid);
        setCurrentUserRole(localStorage.getItem('userRole'));
      } else {
        setCurrentUserUid(null);
        setCurrentUserRole(null);
      }
    });

    if(mounted){ // Keep this for initial uniform load
      const storedUniforms = localStorage.getItem('updatedUniformsData');
      const liveUniforms = storedUniforms ? JSON.parse(storedUniforms) : initialUniforms;
      setAllUniforms(liveUniforms);
      setEntryDate(new Date().toISOString().split('T')[0]); 
      setLoading(false);
    }
    return () => unsubscribe();
  }, [mounted]);

  const availableCategories = useMemo(() => {
    const categories = new Set(allUniforms.map(u => u.category));
    return Array.from(categories);
  }, [allUniforms]);

  const filteredUniformsForDisplay = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES_VALUE) {
      return allUniforms;
    }
    return allUniforms.filter(uni => uni.category === selectedCategory);
  }, [allUniforms, selectedCategory]);

  const handleStockInputChange = (uniformId: string, size: string, value: string) => {
    setStockInputs(prev => ({
      ...prev,
      [uniformId]: {
        ...prev[uniformId],
        [size]: value,
      }
    }));
  };

  const handleSubmit = () => {
    if (!mounted || !currentUserUid || !currentUserRole) {
        toast({ title: "Error", description: "No se pudo identificar al usuario. Intenta iniciar sesión de nuevo.", variant: "destructive" });
        return;
    }

    let currentUniformsData = JSON.parse(localStorage.getItem('updatedUniformsData') || JSON.stringify(initialUniforms)) as Uniform[];
    let changesMade = false;
    const enteredItemsDetails: StockEntryItemDetails[] = [];

    Object.entries(stockInputs).forEach(([uniformId, sizes]) => {
      Object.entries(sizes).forEach(([size, quantityStr]) => {
        const quantityToAdd = parseInt(quantityStr, 10);
        if (!isNaN(quantityToAdd) && quantityToAdd > 0) {
          changesMade = true;
          const uniform = allUniforms.find(u => u.id === uniformId);
          if (uniform) {
            enteredItemsDetails.push({
              uniformId,
              uniformName: uniform.name,
              category: uniform.category,
              size,
              quantityAdded: quantityToAdd,
            });
          }

          currentUniformsData = currentUniformsData.map(uni => {
            if (uni.id === uniformId) {
              return {
                ...uni,
                sizes: uni.sizes.map(s => {
                  if (s.size === size) {
                    return { ...s, stock: s.stock + quantityToAdd };
                  }
                  return s;
                })
              };
            }
            return uni;
          });
        }
      });
    });

    if (!changesMade) {
      toast({ title: "Sin Cambios", description: "No se ingresaron cantidades para agregar al stock.", variant: "default" });
      return;
    }

    localStorage.setItem('updatedUniformsData', JSON.stringify(currentUniformsData));
    setAllUniforms(currentUniformsData); 
    setStockInputs({}); 
    
    if (enteredItemsDetails.length > 0) {
      const totalQuantityAddedInEntry = enteredItemsDetails.reduce((sum, item) => sum + item.quantityAdded, 0);
      const newStockEntry: StockEntry = {
        id: `stock-entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // Keep unique ID for localStorage
        date: entryDate || new Date().toISOString().split('T')[0],
        recordedAt: new Date().toISOString(),
        enteredBy: currentUserUid, // Firebase UID
        enteredByRole: currentUserRole as 'admin' | 'secretary', // User role
        items: enteredItemsDetails,
        totalQuantityAdded: totalQuantityAddedInEntry,
        notes: entryNotes.trim() || `Ingreso de ${totalQuantityAddedInEntry} unidades.`,
      };

      const currentStockEntries = JSON.parse(localStorage.getItem('stockEntryHistory') || '[]') as StockEntry[];
      localStorage.setItem('stockEntryHistory', JSON.stringify([...currentStockEntries, newStockEntry]));
      setEntryNotes('');
    }

    toast({
      title: "Stock Actualizado",
      description: "Las cantidades ingresadas han sido añadidas al inventario y el ingreso ha sido registrado en el historial.",
    });
    
    router.push('/inventory'); 
  };
  
  if (!mounted || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <Card className="shadow-lg">
          <CardHeader> <div className="h-6 bg-muted rounded w-1/2"></div> <div className="h-4 bg-muted rounded w-3/4"></div> </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 bg-muted rounded w-1/3 mb-4"></div>
            {[...Array(3)].map((_, i) => ( <div key={i} className="space-y-1"> <div className="h-5 bg-muted rounded w-1/4"></div> <div className="h-8 bg-muted rounded w-full"></div> </div> ))}
            <div className="h-10 bg-primary/50 rounded w-1/3 mt-6"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4 shadow hover:shadow-md">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al Inventario
      </Button>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center"> <PackagePlus className="mr-3 h-6 w-6 text-primary" /> Ingresar Stock de Prendas (Masivo) </CardTitle>
          <CardDescription> Registra la entrada de nuevas prendas al inventario. Ingresa las cantidades para cada talla. </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1"> <Label htmlFor="category-filter">Filtrar por Categoría</Label> <Select value={selectedCategory} onValueChange={setSelectedCategory}> <SelectTrigger id="category-filter" className="shadow hover:shadow-md mt-1"> <Filter className="mr-2 h-4 w-4 text-muted-foreground" /> <SelectValue placeholder="Seleccionar categoría" /> </SelectTrigger> <SelectContent> <SelectItem value={ALL_CATEGORIES_VALUE}>Todas las categorías</SelectItem> {availableCategories.map(category => ( <SelectItem key={category} value={category}>{category}</SelectItem> ))} </SelectContent> </Select> </div>
            <div className="md:col-span-1"> <Label htmlFor="entryDate">Fecha de Ingreso</Label> <Input  id="entryDate" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="mt-1" /> </div>
            <div className="md:col-span-1"> <Label htmlFor="entryNotes">Notas (Opcional)</Label> <Input id="entryNotes" type="text" placeholder="Ej: Pedido Proveedor X" value={entryNotes} onChange={(e) => setEntryNotes(e.target.value)} className="mt-1" /> </div>
          </div>

          <ScrollArea className="h-[500px] pr-4 border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10"> <TableRow> <TableHead>Prenda</TableHead> <TableHead>Talla</TableHead> <TableHead className="text-right">Stock Actual</TableHead> <TableHead className="w-[150px] text-right">Cantidad a Ingresar</TableHead> </TableRow> </TableHeader>
              <TableBody>
                {filteredUniformsForDisplay.length > 0 ? (
                  filteredUniformsForDisplay.map(uni =>
                    uni.sizes.map(s => (
                      <TableRow key={`${uni.id}-${s.size}`}> <TableCell className="font-medium">{uni.name}</TableCell> <TableCell>{s.size}</TableCell> <TableCell className="text-right text-muted-foreground">{s.stock}</TableCell> <TableCell className="text-right"> <Input type="number" value={stockInputs[uni.id]?.[s.size] || ''} onChange={(e) => handleStockInputChange(uni.id, s.size, e.target.value)} className="w-28 text-right tabular-nums" placeholder="0" min="0" /> </TableCell> </TableRow>
                    ))
                  )
                ) : (
                  <TableRow> <TableCell colSpan={4} className="h-24 text-center text-muted-foreground"> {selectedCategory === ALL_CATEGORIES_VALUE && allUniforms.length === 0  ? "No hay prendas en el sistema." : selectedCategory === ALL_CATEGORIES_VALUE  ? "Seleccione una categoría o revise el inventario." : "No hay prendas en la categoría seleccionada."} </TableCell> </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmit} className="shadow hover:shadow-md" disabled={!currentUserUid || !currentUserRole}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Ingresos de Stock
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
