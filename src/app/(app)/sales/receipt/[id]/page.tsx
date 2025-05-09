
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppLogo } from '@/components/AppLogo';
import type { Sale } from '@/lib/mock-data'; 
import { Printer, ArrowLeft, Paperclip } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { formatDisplayId } from '@/lib/utils'; // Import the utility

const ReceiptCardContent = ({ saleData, displayId }: { saleData: Sale, displayId: string }) => {
  if (!saleData) return null;
  return (
    <Card className="shadow-lg print:shadow-none print:border print:border-gray-300 print-receipt-card w-full h-full flex flex-col">
      <CardHeader className="border-b pb-4 print:pb-2 print:pt-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:gap-2">
          <AppLogo 
            showColegioLogoText={true} 
            iconClassName="h-10 w-10 print:h-8 print:w-8" 
            textClassName="text-lg print:text-base"
            subTextClassName="text-xs print:text-[0.6rem]"
          />
          <div className="text-right">
            <CardTitle className="text-xl font-bold text-primary print:text-lg">Recibo de Venta</CardTitle>
            <p className="text-xs text-muted-foreground print:text-[0.7rem]">ID Recibo: {displayId}</p>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground print:text-[0.65rem] print:mt-1">
          <p><strong>Colegio Anglo Español</strong></p>
          <p>Km 1 Vereda Aguas Claras, El Carmen de Viboral</p>
          <p>Tel: +57 324 5665949</p>
        </div>
      </CardHeader>
      <CardContent className="py-4 space-y-3 print:py-2 print:space-y-1.5 flex-grow overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 text-xs print:text-[0.7rem]">
          <div>
            <p className="font-semibold text-foreground">Cliente:</p>
            <p className="text-muted-foreground">{saleData.customerName}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-foreground">Fecha:</p>
            <p className="text-muted-foreground">{new Date(saleData.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-muted-foreground">{new Date(saleData.date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit'})}</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Atendido por:</p>
            <p className="text-muted-foreground capitalize">{saleData.generatedBy}</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Método de Pago:</p>
            <p className="text-muted-foreground capitalize">{saleData.paymentMethod === 'transferencia' ? 'Transferencia' : 'Efectivo'}</p>
          </div>
          {saleData.paymentMethod === 'transferencia' && saleData.paymentProofFileName && (
            <div className="col-span-2">
              <p className="font-semibold text-foreground">Comprobante:</p>
              <p className="text-muted-foreground flex items-center gap-1">
                <Paperclip className="h-3 w-3 print:h-2.5 print:w-2.5" /> {saleData.paymentProofFileName}
              </p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-1 text-foreground print:text-xs print:mb-0.5">Detalle de la Compra:</h3>
          <div className="overflow-x-auto rounded-md border print:border-none">
          <Table className="print:text-[0.7rem]">
            <TableHeader>
              <TableRow className="print:text-[0.65rem]">
                <TableHead className="print:p-1">Prenda</TableHead>
                <TableHead className="print:p-1">Talla</TableHead>
                <TableHead className="text-right print:p-1">P.Unit.</TableHead>
                <TableHead className="text-right print:p-1">Cant.</TableHead>
                <TableHead className="text-right print:p-1">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saleData.items.map((item, index) => (
                <TableRow key={`${item.uniformId}-${item.size}-${index}`} className="print:p-0.5">
                  <TableCell className="font-medium print:p-1">{item.uniformName}</TableCell>
                  <TableCell className="print:p-1">{item.size}</TableCell>
                  <TableCell className="text-right print:p-1">COP {item.unitPrice.toLocaleString('es-CO', {minimumFractionDigits: 0})}</TableCell>
                  <TableCell className="text-right print:p-1">{item.quantity}</TableCell>
                  <TableCell className="text-right print:p-1">COP {item.totalPrice.toLocaleString('es-CO', {minimumFractionDigits: 0})}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t print:mt-1 print:pt-1 flex justify-end">
          <div className="w-full sm:w-auto text-right space-y-0.5">
              <p className="text-base font-bold text-foreground print:text-sm">
                  TOTAL: <span className="text-primary">COP {saleData.totalAmount.toLocaleString('es-CO', {minimumFractionDigits: 0})}</span>
              </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-2 text-center text-[0.6rem] text-muted-foreground flex-col space-y-0.5 print:pt-1">
        <p>Gracias por su compra. Conserva este recibo para cualquier aclaración.</p>
        <p>&copy; {new Date().getFullYear()} {siteConfig.name}</p>
      </CardFooter>
    </Card>
  );
};


export default function ReceiptPage() {
  const router = useRouter();
  const params = useParams();
  const receiptId = params.id as string;

  const [saleData, setSaleData] = useState<Sale | null>(null);
  const [mounted, setMounted] = useState(false);
  const [displayId, setDisplayId] = useState<string>('');
  
  const printableAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (mounted && receiptId) { // Ensure mounted and receiptId exist
      const allSales = JSON.parse(localStorage.getItem('mockSales') || '[]') as Sale[];
      const foundSale = allSales.find(s => s.id === receiptId);

      if (foundSale) {
        setSaleData(foundSale);
        setDisplayId(formatDisplayId(foundSale.id, foundSale.date));
      } else {
        setSaleData(null); // Sale not found
      }
    }
  }, [receiptId, mounted]);
  
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-background">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Button variant="outline" onClick={() => router.push('/sales/new')} className="shadow hover:shadow-md">
          <ArrowLeft className="mr-2 h-4 w-4" /> Nueva Venta
        </Button>
        <Button onClick={handlePrint} className="shadow hover:shadow-md">
          <Printer className="mr-2 h-4 w-4" /> Imprimir Recibo
        </Button>
      </div>

      {/* Screen View: Shows one receipt */}
      <div className="print:hidden">
        <ReceiptCardContent saleData={saleData} displayId={displayId} />
      </div>
      
      {/* Print View: Shows two copies of the receipt */}
      <div ref={printableAreaRef} className="printable-area hidden">
        {/* Two instances of the receipt for printing */}
        <ReceiptCardContent saleData={saleData} displayId={displayId} />
        <ReceiptCardContent saleData={saleData} displayId={displayId} />
      </div>
      
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact; /* Chrome, Safari */
            print-color-adjust: exact; /* Firefox, Edge */
          }
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
            width: 210mm; /* A4 width */
            height: 297mm; /* A4 height */
            display: flex;
            flex-direction: column;
            justify-content: flex-start; /* Align to top */
            align-items: center; /* Center horizontally */
            gap: 5mm; /* Gap between receipts */
            padding: 5mm; /* Padding for the page */
            box-sizing: border-box;
            overflow: hidden; /* Prevent scrollbars on the print page */
          }
          .print-receipt-card {
            width: 190mm; /* Width of each receipt */
            height: 135mm; /* Height of each receipt, approx half A4 minus gap */
            border: 1px solid #ccc !important;
            box-shadow: none !important;
            page-break-inside: avoid !important; /* Try to keep each receipt on one part */
            overflow: hidden; /* Clip content if it overflows */
            display: flex !important;
            flex-direction: column !important;
          }
          .print-receipt-card > div[class*="CardHeader"] { flex-shrink: 0; }
          .print-receipt-card > div[class*="CardContent"] { flex-grow: 1; overflow-y: hidden; } /* Hidden to prevent internal scrollbars appearing on print */
          .print-receipt-card > div[class*="CardFooter"] { flex-shrink: 0; }

          .print\\:hidden {
            display: none !important;
          }
        }
        @page {
          size: A4;
          margin: 0; /* Remove browser default margins */
        }
      `}</style>
    </div>
  );
}
