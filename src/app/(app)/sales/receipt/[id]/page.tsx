"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppLogo } from '@/components/AppLogo';
import type { Sale } from '@/lib/mock-data'; // Assuming Sale type is defined here
import { Printer, ArrowLeft } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function ReceiptPage() {
  const router = useRouter();
  const params = useParams();
  const receiptId = params.id as string;

  const [saleData, setSaleData] = useState<Sale | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const storedSaleData = localStorage.getItem('currentSaleForReceipt');
      if (storedSaleData) {
        const parsedData: Sale = JSON.parse(storedSaleData);
        // Check if the ID matches, though in this mock, it's just the latest.
        // In a real app, you'd fetch by receiptId.
        if (parsedData.id === receiptId) {
          setSaleData(parsedData);
        } else {
          // Data mismatch or not found, redirect or show error
          // For now, try to use it anyway if it's the only thing in localStorage
           setSaleData(parsedData); 
           // Ideally: router.push('/sales/new'); // Or show "Receipt not found"
        }
        // Optionally clear it after use if it's a one-time transfer mechanism
        // localStorage.removeItem('currentSaleForReceipt'); 
      } else {
        // No data found, redirect or show error
        // router.push('/sales/new'); // Or show "Receipt not found"
      }
    }
  }, [receiptId, router]);
  
  const handlePrint = () => {
    if (mounted) {
      window.print();
    }
  };

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">Cargando recibo...</div>;
  }

  if (!saleData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle>Recibo no encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No se pudo cargar la información del recibo. Es posible que el enlace haya expirado o sea incorrecto.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/sales/new')} className="mx-auto">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Ventas
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 bg-background">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Button variant="outline" onClick={() => router.back()} className="shadow hover:shadow-md">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <Button onClick={handlePrint} className="shadow hover:shadow-md">
          <Printer className="mr-2 h-4 w-4" /> Imprimir Recibo
        </Button>
      </div>

      <Card className="shadow-lg print:shadow-none print:border-none">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <AppLogo showColegioLogo={true} iconClassName="h-10 w-10" textClassName="text-2xl" />
            <div className="text-right">
              <CardTitle className="text-2xl font-bold text-primary">Recibo de Venta</CardTitle>
              <p className="text-sm text-muted-foreground">ID Recibo: {saleData.id}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p><strong>Colegio Anglo Español</strong></p>
            <p>Dirección Ficticia 123, Ciudad</p>
            <p>Tel: (55) 1234-5678</p>
          </div>
        </CardHeader>
        <CardContent className="py-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-foreground">Cliente:</p>
              <p className="text-muted-foreground">{saleData.customerName}</p>
            </div>
            <div className="sm:text-right">
              <p className="font-semibold text-foreground">Fecha:</p>
              <p className="text-muted-foreground">{new Date(saleData.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-muted-foreground">{new Date(saleData.date).toLocaleTimeString('es-MX')}</p>
            </div>
             <div>
              <p className="font-semibold text-foreground">Atendido por:</p>
              <p className="text-muted-foreground capitalize">{saleData.generatedBy}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Detalle de la Compra:</h3>
            <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prenda</TableHead>
                  <TableHead>Talla</TableHead>
                  <TableHead className="text-right">Precio Unit.</TableHead>
                  <TableHead className="text-right">Cant.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleData.items.map((item, index) => (
                  <TableRow key={`${item.uniformId}-${item.size}-${index}`}>
                    <TableCell className="font-medium">{item.uniformName}</TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.totalPrice.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t flex justify-end">
            <div className="w-full sm:w-auto text-right space-y-1">
                {/* Add subtotal, IVA, etc. if needed here */}
                <p className="text-xl font-bold text-foreground">
                    TOTAL: <span className="text-primary">${saleData.totalAmount.toFixed(2)} MXN</span>
                </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 text-center text-xs text-muted-foreground">
          <p>Gracias por su compra. Conserva este recibo para cualquier aclaración.</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} {siteConfig.name} - Colegio Anglo Español</p>
        </CardFooter>
      </Card>
      
      {/* CSS for printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
           .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
        }
      `}</style>
      <div className="printable-area hidden"> {/* This div is for ensuring @media print styles are picked up by Tailwind for the receipt card */}
        <Card>
            <CardHeader></CardHeader>
            <CardContent></CardContent>
            <CardFooter></CardFooter>
        </Card>
      </div>
    </div>
  );
}
