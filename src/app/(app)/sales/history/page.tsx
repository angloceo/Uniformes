
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { mockSales, type Sale, initialUniforms, type Uniform } from '@/lib/mock-data';
import { formatDisplayId } from '@/lib/utils';
import { ReceiptText, Eye, Search, ArrowLeft, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase'; // For checking current user role
// import { db } from '@/lib/firebase'; // If fetching usernames
// import { collection, getDocs, query, where, documentId } from 'firebase/firestore';

const ITEMS_PER_PAGE = 10;

export default function SalesHistoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [allSales, setAllSales = useState<Sale[]>([]);
  const [loading, setLoading = useState(true);
  const [mounted, setMounted = useState(false);
  // const [userDisplayNames, setUserDisplayNames = useState<Record<string, string>>({}); // UID -> Username mapping
  const [searchTerm, setSearchTerm = useState('');
  const [sortColumn, setSortColumn = useState<'date' | 'totalAmount' | 'customerName'>('date');
  const [sortDirection, setSortDirection = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage = useState(1);
  const [currentUserAppRole, setCurrentUserAppRole = useState<string | null>(null); // Store current user's app role
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog = useState(false);
  const [saleToDelete, setSaleToDelete = useState<Sale | null>(null);

  useEffect(() => {
    setMounted(true);
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUserAppRole(localStorage.getItem('userRole')); // Get role from LS
      } else {
        setCurrentUserAppRole(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (mounted) {
      const storedSales = localStorage.getItem('mockSales');
      const liveSales = storedSales ? JSON.parse(storedSales) : mockSales; // Use mockSales as fallback
      setAllSales(liveSales);

      // If fetching usernames from Firestore:
      // const fetchUsernames = async (salesToProcess: Sale[]) => {
      //   const userIds = Array.from(new Set(salesToProcess.map(sale => sale.generatedBy).filter(uid => uid && !userDisplayNames[uid])));
      //   if (userIds.length > 0) {
      //     const usersQuery = query(collection(db, "users"), where(documentId(), "in", userIds));
      //     const querySnapshot = await getDocs(usersQuery);
      //     const newNames: Record<string, string = {};
      //     querySnapshot.forEach(doc => {
      //       newNames[doc.id] = doc.data().username || doc.data().email || 'Desconocido';
      //     });
      //     setUserDisplayNames(prev => ({ ...prev, ...newNames }));
      //   }
      // };
      // fetchUsernames(liveSales);
      setLoading(false);
    }
  }, [mounted]);

  const filteredAndSortedSales = useMemo(() => {
    let sales = [...allSales];
    if (searchTerm) {
      sales = sales.filter(sale =>
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDisplayId(sale.id, sale.date).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.generatedByRole && sale.generatedByRole.toLowerCase().includes(searchTerm.toLowerCase()))
        // (userDisplayNames[sale.generatedBy] && userDisplayNames[sale.generatedBy].toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    sales.sort((a, b) => {
      let comparison = 0;
      if (sortColumn === 'date') comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortColumn === 'totalAmount') comparison = a.totalAmount - b.totalAmount;
      else if (sortColumn === 'customerName') comparison = a.customerName.localeCompare(b.customerName);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sales;
  }, [allSales, searchTerm, sortColumn, sortDirection /*, userDisplayNames */]);

  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedSales, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedSales.length / ITEMS_PER_PAGE);

  const handleSort = (column: 'date' | 'totalAmount' | 'customerName') => {
    if (sortColumn === column) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortColumn(column); setSortDirection('desc'); }
    setCurrentPage(1); 
  };

  const handleDeleteSale = (sale: Sale) => {
    if (currentUserAppRole !== 'admin') {
      toast({ title: "Permiso Denegado", description: "Solo los administradores pueden eliminar ventas.", variant: "destructive" });
      return;
    }
    setSaleToDelete(sale);
    setShowDeleteConfirmDialog(true);
  };

  const confirmDeleteSale = () => {
    if (!saleToDelete || currentUserAppRole !== 'admin') return;

    let currentUniformsData: Uniform[] = JSON.parse(localStorage.getItem('updatedUniformsData') || JSON.stringify(initialUniforms));
    saleToDelete.items.forEach(soldItem => {
      currentUniformsData = currentUniformsData.map(uni => uni.id === soldItem.uniformId ? { ...uni, sizes: uni.sizes.map(s => s.size === soldItem.size ? { ...s, stock: s.stock + soldItem.quantity } : s) } : uni);
    });
    localStorage.setItem('updatedUniformsData', JSON.stringify(currentUniformsData));

    const updatedSales = allSales.filter(s => s.id !== saleToDelete.id);
    setAllSales(updatedSales);
    localStorage.setItem('mockSales', JSON.stringify(updatedSales));

    toast({ title: "Venta Eliminada", description: `La venta ${formatDisplayId(saleToDelete.id, saleToDelete.date)} ha sido eliminada y el stock revertido.` });
    setShowDeleteConfirmDialog(false);
    setSaleToDelete(null);
  };
  
  if (!mounted || loading) {
    return ( <div className="space-y-6"> <div className="flex justify-between items-center"> <Skeleton className="h-8 w-1/4" /> <Skeleton className="h-10 w-24" /> </div> <Card className="shadow-lg"> <CardHeader> <Skeleton className="h-6 w-1/2" /> <Skeleton className="h-4 w-3/4 mt-1" /> </CardHeader> <CardContent> <Skeleton className="h-10 w-full mb-4" /> {[...Array(5)].map((_, i) => ( <Skeleton key={i} className="h-12 w-full mb-2" /> ))} <div className="flex justify-between items-center mt-4"> <Skeleton className="h-8 w-20" /> <Skeleton className="h-8 w-20" /> </div> </CardContent> </Card> </div> );
  }

  return (
    <div className="space-y-6">
       <Button variant="outline" onClick={() => router.back()} className="mb-4 shadow hover:shadow-md"> <ArrowLeft className="mr-2 h-4 w-4" /> Volver </Button>
      <Card className="shadow-xl">
        <CardHeader> <CardTitle className="text-2xl font-semibold flex items-center"> <ReceiptText className="mr-3 h-6 w-6 text-primary" /> Historial de Ventas </CardTitle> <CardDescription>Consulta el registro de todas las ventas realizadas en el sistema.</CardDescription> </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col sm:flex-row gap-4"> <div className="relative flex-grow"> <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> <Input type="search" placeholder="Buscar por cliente, ID recibo, vendedor..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-10 w-full" /> </div> </div>

          {paginatedSales.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader> <TableRow> <TableHead className="cursor-pointer hover:bg-muted/80" onClick={() => handleSort('date')}> Fecha {sortColumn === 'date' && (sortDirection === 'asc' ? '▲' : '▼')} </TableHead> <TableHead>ID Recibo</TableHead> <TableHead className="cursor-pointer hover:bg-muted/80" onClick={() => handleSort('customerName')}> Cliente {sortColumn === 'customerName' && (sortDirection === 'asc' ? '▲' : '▼')} </TableHead> <TableHead className="text-right cursor-pointer hover:bg-muted/80" onClick={() => handleSort('totalAmount')}> Total {sortColumn === 'totalAmount' && (sortDirection === 'asc' ? '▲' : '▼')} </TableHead> <TableHead>Atendido por</TableHead> <TableHead>Método Pago</TableHead> <TableHead className="text-center">Acciones</TableHead> </TableRow> </TableHeader>
                  <TableBody>
                    {paginatedSales.map((sale) => (
                      <TableRow key={sale.id} className="hover:bg-muted/50">
                        <TableCell> {new Date(sale.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })} <br /> <span className="text-xs text-muted-foreground"> {new Date(sale.date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} </span> </TableCell>
                        <TableCell className="font-mono text-xs">{formatDisplayId(sale.id, sale.date)}</TableCell>
                        <TableCell className="font-medium">{sale.customerName}</TableCell>
                        <TableCell className="text-right">COP {sale.totalAmount.toLocaleString('es-CO')}</TableCell>
                        <TableCell className="capitalize">{ /* userDisplayNames[sale.generatedBy] || */ sale.generatedByRole || 'Desconocido'}</TableCell>
                        <TableCell className="capitalize">{sale.paymentMethod === 'transferencia' ? 'Transferencia' : 'Efectivo'}</TableCell>
                        <TableCell className="text-center space-x-1"> <Button asChild variant="outline" size="sm" className="shadow-sm hover:shadow"> <Link href={`/sales/receipt/${sale.id}`}> <Eye className="mr-1.5 h-3.5 w-3.5" /> Ver </Link> </Button> {currentUserAppRole === 'admin' && ( <Button variant="destructive" size="sm" onClick={() => handleDeleteSale(sale)} className="shadow-sm hover:shadow"> <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Eliminar </Button> )} </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && ( <div className="flex justify-between items-center mt-6"> <Button variant="outline" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} > Anterior </Button> <span className="text-sm text-muted-foreground"> Página {currentPage} de {totalPages} </span> <Button variant="outline" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} > Siguiente </Button> </div> )}
            </>
          ) : ( <div className="h-40 flex flex-col items-center justify-center text-center border rounded-md"> <ReceiptText className="w-12 h-12 text-muted-foreground mb-3" /> <p className="text-lg font-medium text-muted-foreground">No hay ventas registradas.</p> <p className="text-sm text-muted-foreground"> {searchTerm ? "Prueba con otros términos de búsqueda." : "Cuando registres una venta, aparecerá aquí."} </p> </div> )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <AlertDialogContent> <AlertDialogHeader> <AlertDialogTitle>¿Estás seguro de eliminar esta venta?</AlertDialogTitle> <AlertDialogDescription> Esta acción eliminará permanentemente la venta <span className="font-semibold">{saleToDelete ? formatDisplayId(saleToDelete.id, saleToDelete.date) : ''}</span>. El stock de los artículos de esta venta será revertido. Esta acción no se puede deshacer. </AlertDialogDescription> </AlertDialogHeader> <AlertDialogFooter> <AlertDialogCancel onClick={() => setShowDeleteConfirmDialog(false)}>Cancelar</AlertDialogCancel> <AlertDialogAction onClick={confirmDeleteSale} className="bg-destructive text-destructive-foreground hover:bg-destructive/90"> Eliminar Venta </AlertDialogAction> </AlertDialogFooter> </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
