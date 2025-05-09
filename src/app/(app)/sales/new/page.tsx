
"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { initialUniforms, type Uniform, type SaleItem, type PaymentMethod, type Sale } from '@/lib/mock-data';
import { ShoppingCart, PlusCircle, Trash2, ArrowLeft, FileSignature, UploadCloud } from 'lucide-react';

export default function NewSalePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [uniformsData, setUniformsData] = useState<Uniform[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  
  const [currentUniformId, setCurrentUniformId] = useState<string>('');
  const [currentSize, setCurrentSize] = useState<string>('');
  const [currentQuantity, setCurrentQuantity] = useState<number | string>(1);
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUniforms = typeof window !== 'undefined' ? localStorage.getItem('updatedUniformsData') : null;
    const liveUniforms = storedUniforms ? JSON.parse(storedUniforms) : initialUniforms;
    setUniformsData(liveUniforms);
  }, []);

  const selectedUniformForForm = uniformsData.find(u => u.id === currentUniformId);
  const selectedUniformSizeForForm = selectedUniformForForm?.sizes.find(s => s.size === currentSize);

  const handleAddItemToSale = () => {
    if (!selectedUniformForForm || !selectedUniformSizeForForm || !currentQuantity || Number(currentQuantity) <= 0) {
      toast({ title: "Error", description: "Selecciona prenda, talla y cantidad válida.", variant: "destructive" });
      return;
    }

    if (Number(currentQuantity) > selectedUniformSizeForForm.stock) {
        toast({ title: "Stock Insuficiente", description: `Solo hay ${selectedUniformSizeForForm.stock} unidades de ${selectedUniformForForm.name} (Talla: ${currentSize}).`, variant: "destructive"});
        return;
    }

    const newItem: SaleItem = {
      uniformId: selectedUniformForForm.id,
      uniformName: selectedUniformForForm.name,
      size: currentSize,
      quantity: Number(currentQuantity),
      unitPrice: selectedUniformSizeForForm.price,
      unitCost: selectedUniformSizeForForm.cost, 
      totalPrice: selectedUniformSizeForForm.price * Number(currentQuantity),
      totalCost: selectedUniformSizeForForm.cost * Number(currentQuantity), 
    };

    setSaleItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.uniformId === newItem.uniformId && item.size === newItem.size);
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const combinedQuantity = updatedItems[existingItemIndex].quantity + newItem.quantity;
        
        // Check stock for combined quantity
        const stockForItem = selectedUniformForForm.sizes.find(s => s.size === newItem.size)?.stock ?? 0;
        if (combinedQuantity > stockForItem) {
             toast({ title: "Stock Insuficiente", description: `No puedes agregar ${newItem.quantity} más. Ya tienes ${updatedItems[existingItemIndex].quantity} en el carrito y solo hay ${stockForItem} unidades de ${selectedUniformForForm.name} (Talla: ${newItem.size}).`, variant: "destructive"});
             return prevItems; // Return previous items without change
        }

        updatedItems[existingItemIndex].quantity = combinedQuantity;
        updatedItems[existingItemIndex].totalPrice = updatedItems[existingItemIndex].unitPrice * combinedQuantity;
        updatedItems[existingItemIndex].totalCost = updatedItems[existingItemIndex].unitCost * combinedQuantity;
        return updatedItems;
      }
      return [...prevItems, newItem];
    });

    setCurrentUniformId('');
    setCurrentSize('');
    setCurrentQuantity(1);
  };

  const handleRemoveItem = (uniformId: string, size: string) => {
    setSaleItems(prevItems => prevItems.filter(item => !(item.uniformId === uniformId && item.size === size)));
  };

  const totalSaleAmount = saleItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalSaleCost = saleItems.reduce((sum, item) => sum + item.totalCost, 0);
  const totalSaleProfit = totalSaleAmount - totalSaleCost;


  const handlePaymentProofChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setPaymentProofFile(event.target.files[0]);
    } else {
      setPaymentProofFile(null);
    }
  };

  const handleGenerateReceipt = () => {
    if (saleItems.length === 0) {
      toast({ title: "Venta Vacía", description: "Agrega al menos un artículo.", variant: "destructive" });
      return;
    }
    if (!customerName.trim()) {
        toast({ title: "Nombre del Comprador", description: "Ingresa el nombre del comprador.", variant: "destructive"});
        return;
    }
    if (!paymentMethod) {
        toast({ title: "Método de Pago", description: "Selecciona un método de pago.", variant: "destructive"});
        return;
    }
    
    const saleData: Sale = {
      id: `sale-${Date.now()}`,
      customerName,
      items: saleItems,
      totalAmount: totalSaleAmount,
      totalCostAmount: totalSaleCost,
      totalProfit: totalSaleProfit,
      date: new Date().toISOString(),
      paymentMethod: paymentMethod as PaymentMethod,
      paymentProofFileName: paymentMethod === 'transferencia' ? paymentProofFile?.name : undefined,
      generatedBy: mounted ? localStorage.getItem('userRole') || 'unknown' : 'unknown'
    };


    if (mounted) {
      localStorage.setItem('currentSaleForReceipt', JSON.stringify(saleData));
      const currentSales = JSON.parse(localStorage.getItem('mockSales') || JSON.stringify([])) as Sale[];
      localStorage.setItem('mockSales', JSON.stringify([...currentSales, saleData]));

      let currentUniformsData = JSON.parse(localStorage.getItem('updatedUniformsData') || JSON.stringify(initialUniforms)) as Uniform[];
      saleData.items.forEach(soldItem => {
        currentUniformsData = currentUniformsData.map(uni => {
          if (uni.id === soldItem.uniformId) {
            return {
              ...uni,
              sizes: uni.sizes.map(s => {
                if (s.size === soldItem.size) {
                  return {...s, stock: s.stock - soldItem.quantity};
                }
                return s;
              })
            };
          }
          return uni;
        });
      });
      localStorage.setItem('updatedUniformsData', JSON.stringify(currentUniformsData));
      setUniformsData(currentUniformsData); 
    }
    router.push(`/sales/receipt/${saleData.id}`);
  };
  
  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4 shadow hover:shadow-md">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center">
            <ShoppingCart className="mr-3 h-6 w-6 text-primary" />
            Registrar Nueva Venta
          </CardTitle>
          <CardDescription>Completa los detalles para registrar una nueva venta de uniformes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <Label htmlFor="customerName" className="text-base font-medium">Nombre del Comprador</Label>
            <Input 
              id="customerName" 
              placeholder="Ej: Juan Pérez" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1"
            />
          </div>

          <Card className="border-dashed border-2 border-primary/50 shadow-inner">
            <CardHeader>
              <CardTitle className="text-lg">Agregar Prenda a la Venta</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <Label htmlFor="uniformType">Tipo de Prenda</Label>
                <Select value={currentUniformId} onValueChange={(value) => { setCurrentUniformId(value); setCurrentSize(''); }}>
                  <SelectTrigger id="uniformType"><SelectValue placeholder="Seleccionar prenda..." /></SelectTrigger>
                  <SelectContent>
                    {uniformsData.map(uni => (
                      <SelectItem key={uni.id} value={uni.id}>{uni.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="uniformSize">Talla</Label>
                <Select value={currentSize} onValueChange={setCurrentSize} disabled={!selectedUniformForForm}>
                  <SelectTrigger id="uniformSize"><SelectValue placeholder="Talla..." /></SelectTrigger>
                  <SelectContent>
                    {selectedUniformForForm?.sizes.map(s => (
                      <SelectItem key={s.size} value={s.size} disabled={s.stock === 0}>
                        {s.size} {s.stock === 0 ? '(Agotado)' : `(Stock: ${s.stock})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Cantidad</Label>
                <Input id="quantity" type="number" placeholder="1" value={currentQuantity} onChange={(e) => setCurrentQuantity(e.target.value ? Number(e.target.value) : '')} min="1" />
              </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleAddItemToSale} type="button" className="shadow hover:shadow-md" disabled={!selectedUniformForForm || !currentSize || !currentQuantity || Number(currentQuantity) <= 0}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Agregar a la Venta
                </Button>
            </CardFooter>
          </Card>

          {saleItems.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-3">Artículos en esta Venta</h3>
              <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prenda</TableHead>
                    <TableHead>Talla</TableHead>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-center">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saleItems.map((item, index) => (
                    <TableRow key={`${item.uniformId}-${item.size}-${index}`}>
                      <TableCell className="font-medium">{item.uniformName}</TableCell>
                      <TableCell>{item.size}</TableCell>
                      <TableCell className="text-right">COP {item.unitPrice.toLocaleString('es-CO')}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right font-semibold">COP {item.totalPrice.toLocaleString('es-CO')}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.uniformId, item.size)} className="text-destructive hover:text-destructive/80">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Label className="text-base font-medium">Método de Pago</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="efectivo" id="efectivo" />
                <Label htmlFor="efectivo">Efectivo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="transferencia" id="transferencia" />
                <Label htmlFor="transferencia">Transferencia Bancaria</Label>
              </div>
            </RadioGroup>

            {paymentMethod === 'transferencia' && (
              <div>
                <Label htmlFor="paymentProof">Comprobante de Pago (Opcional)</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input 
                    id="paymentProof" 
                    type="file" 
                    onChange={handlePaymentProofChange}
                    className="w-full" 
                    accept="image/*,.pdf"
                  />
                  <UploadCloud className="h-5 w-5 text-muted-foreground"/>
                </div>
                {paymentProofFile && <p className="text-xs text-muted-foreground mt-1">Archivo: {paymentProofFile.name}</p>}
              </div>
            )}
          </div>

          <div className="text-right mt-6">
            <p className="text-2xl font-bold text-foreground">
              Total: <span className="text-primary">COP {totalSaleAmount.toLocaleString('es-CO')}</span>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleGenerateReceipt} size="lg" className="shadow-lg hover:shadow-xl" disabled={saleItems.length === 0 || !customerName.trim() || !paymentMethod }>
            <FileSignature className="mr-2 h-5 w-5" />
            Generar Recibo
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

