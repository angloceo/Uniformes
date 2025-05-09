"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { initialUniforms, type Uniform } from '@/lib/mock-data';
import { ArrowLeft, PackagePlus } from 'lucide-react';

export default function AddStockPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [uniforms, setUniforms] = useState<Uniform[]>([]);
  const [selectedUniformId, setSelectedUniformId] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number | string>('');
  const [entryDate, setEntryDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUniforms(initialUniforms);
    setEntryDate(new Date().toISOString().split('T')[0]); // Default to today
    setLoading(false);
  }, []);

  const selectedUniform = uniforms.find(u => u.id === selectedUniformId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUniformId || !selectedSize || !quantity || Number(quantity) <= 0) {
      toast({
        title: "Error de Validación",
        description: "Por favor, complete todos los campos correctamente.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would update the backend/database
    console.log({
      uniformId: selectedUniformId,
      size: selectedSize,
      quantity: Number(quantity),
      date: entryDate,
    });

    toast({
      title: "Stock Ingresado",
      description: `${quantity} unidades de ${selectedUniform?.name} (Talla: ${selectedSize}) ingresadas.`,
    });
    // Reset form or navigate
    // setSelectedUniformId('');
    // setSelectedSize('');
    // setQuantity('');
    router.push('/inventory'); // Navigate back to inventory list
  };
  
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <Card className="shadow-lg">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-10 bg-muted rounded w-full"></div>
              </div>
            ))}
            <div className="h-10 bg-primary/50 rounded w-1/3 mt-4"></div>
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

      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center">
            <PackagePlus className="mr-3 h-6 w-6 text-primary" />
            Ingresar Stock de Prendas
          </CardTitle>
          <CardDescription>
            Registra la entrada de nuevas prendas al inventario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="uniform">Tipo de Prenda</Label>
              <Select value={selectedUniformId} onValueChange={setSelectedUniformId}>
                <SelectTrigger id="uniform">
                  <SelectValue placeholder="Selecciona una prenda" />
                </SelectTrigger>
                <SelectContent>
                  {uniforms.map(uni => (
                    <SelectItem key={uni.id} value={uni.id}>{uni.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUniform && (
              <div>
                <Label htmlFor="size">Talla</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize} disabled={!selectedUniformId}>
                  <SelectTrigger id="size">
                    <SelectValue placeholder="Selecciona una talla" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedUniform.sizes.map(s => (
                      <SelectItem key={s.size} value={s.size}>{s.size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="quantity">Cantidad</Label>
              <Input 
                id="quantity" 
                type="number" 
                placeholder="Ej: 10" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="entryDate">Fecha de Ingreso</Label>
              <Input 
                id="entryDate" 
                type="date" 
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full sm:w-auto shadow hover:shadow-md" disabled={!selectedUniformId || !selectedSize || !quantity}>
              <PackagePlus className="mr-2 h-4 w-4" />
              Registrar Ingreso
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
