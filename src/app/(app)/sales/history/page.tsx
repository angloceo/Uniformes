
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDisplayId, cn } from "@/lib/utils";
import { ReceiptText, Eye, Search, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Sale, Uniform } from "@/lib/mock-data"; // Assuming Sale type is exported
import { initialUniforms, deleteSaleFromStorage } from "@/lib/mock-data";


export default function SalesHistoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setLoading(true);
      try {
        const storedSalesRaw = localStorage.getItem('mockSales');
        const loadedSales = storedSalesRaw ? JSON.parse(storedSalesRaw) : [];
        setSales(loadedSales);
      } catch (error) {
        console.error("Error loading sales from localStorage:", error);
        setSales([]); // Fallback to empty array on error
        toast({ title: "Error", description: "No se pudieron cargar las ventas.", variant: "destructive" });
      }
      setLoading(false);
    }
  }, [mounted, toast]);

  const handleDeleteSaleConfirmed = async () => {
    if (!saleToDelete) return;
    setIsDeleting(true);

    const success = deleteSaleFromStorage(saleToDelete.id);

    if (success) {
      try {
        const updatedSalesRaw = localStorage.getItem('mockSales');
        setSales(updatedSalesRaw ? JSON.parse(updatedSalesRaw) : []);
        toast({
          title: "Venta Eliminada",
          description: `La venta ${formatDisplayId(saleToDelete.id, saleToDelete.date)} ha sido eliminada y el stock revertido.`,
        });
      } catch (error) {
         console.error("Error reloading sales after deletion:", error);
         toast({ title: "Error", description: "No se pudieron recargar las ventas después de la eliminación.", variant: "destructive" });
      }
    } else {
      toast({ title: "Error", description: "No se pudo eliminar la venta o actualizar el stock.", variant: "destructive" });
    }
    setSaleToDelete(null);
    setShowDeleteConfirmDialog(false);
    setIsDeleting(false);
  };


  const filteredSales = useMemo(() => {
    return sales.filter((sale: Sale) => {
      return (
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDisplayId(sale.id, sale.date).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [sales, searchTerm]);

  const sortedSales = useMemo(() => {
    return [...filteredSales].sort((a: Sale, b: Sale) => {
      let comparison = 0;
      if (sortColumn === "date") {
        comparison = new Date(b.date).getTime() - new Date(a.date).getTime(); // Desc by default for date
      } else if (sortColumn === "totalAmount") {
        comparison = b.totalAmount - a.totalAmount; // Desc for amount
      } else { // customerName
        comparison = a.customerName.localeCompare(b.customerName); // Asc for name
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredSales, sortColumn, sortDirection]);

  const paginatedSales = sortedSales.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(sortedSales.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortColumn, sortDirection]); 

  if (!mounted || loading) {
    return (
      <div className="space-y-6 container mx-auto py-6">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-4" />
            {[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full mb-2" />))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto py-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4 shadow hover:shadow-md">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-semibold">
            <ReceiptText className="mr-3 h-6 w-6 text-primary" /> Historial de Ventas
          </CardTitle>
          <CardDescription>Consulta el registro de todas las ventas realizadas en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente o ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto border rounded-md">
            {paginatedSales.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                        className="cursor-pointer hover:bg-muted/50" 
                        onClick={() => { setSortColumn("date"); setSortDirection(prev => sortColumn === "date" && prev === 'desc' ? 'asc' : 'desc'); }}>
                      Fecha {sortColumn === 'date' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </TableHead>
                    <TableHead>ID Recibo</TableHead>
                    <TableHead 
                        className="cursor-pointer hover:bg-muted/50" 
                        onClick={() => { setSortColumn("customerName"); setSortDirection(prev => sortColumn === "customerName" && prev === 'asc' ? 'desc' : 'asc'); }}>
                        Cliente {sortColumn === 'customerName' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </TableHead>
                    <TableHead 
                        className="text-right cursor-pointer hover:bg-muted/50" 
                        onClick={() => { setSortColumn("totalAmount"); setSortDirection(prev => sortColumn === "totalAmount" && prev === 'desc' ? 'asc' : 'desc'); }}>
                        Total {sortColumn === 'totalAmount' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </TableHead>
                    <TableHead>Atendido por</TableHead>
                    <TableHead>Método Pago</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSales.map((sale) => (
                    <TableRow key={sale.id} className="hover:bg-muted/50">
                      <TableCell>
                        {new Date(sale.date).toLocaleDateString("es-CO")}
                        <div className="text-xs text-muted-foreground">
                          {new Date(sale.date).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{formatDisplayId(sale.id, sale.date)}</TableCell>
                      <TableCell>{sale.customerName}</TableCell>
                      <TableCell className="text-right">COP {sale.totalAmount.toLocaleString("es-CO")}</TableCell>
                      <TableCell className="capitalize">{sale.generatedByRole}</TableCell>
                      <TableCell className="capitalize">{sale.paymentMethod}</TableCell>
                      <TableCell className="text-center space-x-1">
                        <Button asChild variant="outline" size="sm" className="shadow hover:shadow-md">
                          <Link href={`/sales/receipt/${sale.id}`}>
                            <Eye className="mr-1.5 h-3.5 w-3.5" /> Ver
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="shadow hover:shadow-md"
                          disabled={isDeleting}
                          onClick={() => {
                            setSaleToDelete(sale);
                            setShowDeleteConfirmDialog(true);
                          }}>
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center text-muted-foreground">
                <ReceiptText className="w-12 h-12 mb-3" />
                <p className="text-lg font-medium">No hay ventas registradas.</p>
                <p className="text-sm">
                  {searchTerm ? "Prueba con otro término de búsqueda." : "Cuando registres una venta, aparecerá aquí."}
                </p>
              </div>
            )}
          </div>

          {totalPages > 1 && paginatedSales.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <Button variant="outline" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>Anterior</Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Button variant="outline" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>Siguiente</Button>
            </div>
          )}
          
          <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro de eliminar esta venta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente la venta 
                  <span className="font-semibold"> {saleToDelete ? formatDisplayId(saleToDelete.id, saleToDelete.date) : ''} </span>
                   y revertirá el stock correspondiente. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting} onClick={() => setShowDeleteConfirmDialog(false)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction disabled={isDeleting} onClick={handleDeleteSaleConfirmed} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {isDeleting ? "Eliminando..." : "Confirmar Eliminación"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

// Note: The Sale interface was previously defined in this file, it's better to import it from mock-data.
// Interface Sale is now imported from "@/lib/mock-data"
