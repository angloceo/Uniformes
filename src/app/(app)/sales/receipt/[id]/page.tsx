
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppLogo } from '@/components/AppLogo';
import type { Sale } from '@/lib/mock-data'; 
import { Printer, ArrowLeft, Paperclip } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function ReceiptPage() {
  const router = useRouter();
  const params = useParams();
  const receiptId = params.id as string;

  const [saleData, setSaleData] = useState<Sale | null>(null);
  const [mounted, setMounted] = useState(false);
  const [displayId, setDisplayId] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const storedSaleData = localStorage.getItem('currentSaleForReceipt');
      if (storedSaleData) {
        const parsedData: Sale = JSON.parse(storedSaleData);
        // Ensure we are showing the correct receipt if multiple tabs were open or similar edge cases
        // For this mock, we'll assume currentSaleForReceipt is the one just generated.
        // In a real app, you'd fetch by ID.
        if (parsedData.id === receiptId) {
           setSaleData(parsedData);
           const datePart = new Date(parsedData.date).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '');
           const sequencePart = parsedData.id.substring(parsedData.id.length - 4).toUpperCase(); // Use last 4 chars of timestamp as mock sequence
           setDisplayId(`${datePart}-${sequencePart}`);
        } else {
            // Fallback or redirect if ID mismatch, for now, show it, but log a warning.
            console.warn("Receipt ID mismatch, but showing stored data for demo purposes.");
            setSaleData(parsedData); // In a real app, you might redirect or show error.
            const datePart = new Date(parsedData.date).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '');
            const sequencePart = parsedData.id.substring(parsedData.id.length - 4).toUpperCase();
            setDisplayId(`${datePart}-${sequencePart}`);
        }
      }
    }
  }, [receiptId]);
  
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
              <p className="text-sm text-muted-foreground">ID Recibo: {displayId}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p><strong>Colegio Anglo Español</strong></p>
            <p>Km 1 Vereda Aguas Claras, El Carmen de Viboral</p>
            <p>Tel: +57 324 5665949</p>
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
              <p className="text-muted-foreground">{new Date(saleData.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-muted-foreground">{new Date(saleData.date).toLocaleTimeString('es-CO')}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Atendido por:</p>
              <p className="text-muted-foreground capitalize">{saleData.generatedBy}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Método de Pago:</p>
              <p className="text-muted-foreground capitalize">{saleData.paymentMethod === 'transferencia' ? 'Transferencia Bancaria' : 'Efectivo'}</p>
            </div>
            {saleData.paymentMethod === 'transferencia' && saleData.paymentProofFileName && (
              <div className="sm:col-span-2">
                <p className="font-semibold text-foreground">Comprobante de Pago:</p>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Paperclip className="h-3 w-3" /> {saleData.paymentProofFileName} (Adjunto)
                </p>
              </div>
            )}
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
                    <TableCell className="text-right">COP {item.unitPrice.toLocaleString('es-CO')}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">COP {item.totalPrice.toLocaleString('es-CO')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t flex justify-end">
            <div className="w-full sm:w-auto text-right space-y-1">
                <p className="text-xl font-bold text-foreground">
                    TOTAL: <span className="text-primary">COP {saleData.totalAmount.toLocaleString('es-CO')}</span>
                </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 text-center text-xs text-muted-foreground flex-col space-y-1">
          <p>Gracias por su compra. Conserva este recibo para cualquier aclaración.</p>
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}</p>
        </CardFooter>
      </Card>
      
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
      <div className="printable-area hidden"> {/* This div is for print media query targeting */}
        <Card> {/* Content structure mirrors above for consistent print output if needed, though CSS handles visibility */}
            <CardHeader></CardHeader>
            <CardContent></CardContent>
            <CardFooter></CardFooter>
        </Card>
      </div>
    </div>
  );
}
