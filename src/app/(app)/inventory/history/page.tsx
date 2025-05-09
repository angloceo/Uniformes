
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Added import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockStockEntries, type StockEntry, type StockEntryItemDetails } from '@/lib/mock-data';
import { History, ArrowLeft, Filter, Search, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ITEMS_PER_PAGE = 10;

export default function StockEntryHistoryPage() {
  const router = useRouter();
  const [allEntries, setAllEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [userFilter, setUserFilter] = useState(''); // Filter by user role who entered stock

  const [sortColumn, setSortColumn] = useState<'date' | 'recordedAt' | 'enteredBy' | 'totalQuantityAdded'>('recordedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [selectedEntryDetails, setSelectedEntryDetails] = useState<StockEntryItemDetails[] | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const storedEntries = localStorage.getItem('stockEntryHistory');
      const liveEntries = storedEntries ? JSON.parse(storedEntries) : mockStockEntries;
      setAllEntries(liveEntries);
      setLoading(false);
    }
  }, [mounted]);

  const uniqueUsers = useMemo(() => {
    const users = new Set(allEntries.map(entry => entry.enteredBy));
    return Array.from(users);
  }, [allEntries]);

  const filteredAndSortedEntries = useMemo(() => {
    let entries = [...allEntries];

    if (searchTerm) {
      entries = entries.filter(entry =>
        entry.items.some(item => item.uniformName.toLowerCase().includes(searchTerm.toLowerCase()) || item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entry.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter.start) {
      entries = entries.filter(entry => new Date(entry.date) >= new Date(dateFilter.start));
    }
    if (dateFilter.end) {
      // Adjust end date to include the whole day
      const endDate = new Date(dateFilter.end);
      endDate.setHours(23, 59, 59, 999);
      entries = entries.filter(entry => new Date(entry.date) <= endDate);
    }
    
    if (userFilter) {
      entries = entries.filter(entry => entry.enteredBy === userFilter);
    }

    entries.sort((a, b) => {
      let comparison = 0;
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (sortColumn === 'date' || sortColumn === 'recordedAt') {
        comparison = new Date(valA as string).getTime() - new Date(valB as string).getTime();
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return entries;
  }, [allEntries, searchTerm, dateFilter, userFilter, sortColumn, sortDirection]);

  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedEntries, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedEntries.length / ITEMS_PER_PAGE);

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc'); // Default to desc for new column
    }
    setCurrentPage(1);
  };

  const formatDate = (dateString: string, includeTime = false) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return new Date(dateString).toLocaleDateString('es-CO', options);
  };

  if (!mounted || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
            <div className="flex justify-between items-center mt-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push('/inventory')} className="mb-4 shadow hover:shadow-md">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a Inventario
      </Button>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center">
            <History className="mr-3 h-6 w-6 text-primary" />
            Historial de Ingresos de Stock
          </CardTitle>
          <CardDescription>Consulta todos los registros de entrada de mercancía al inventario.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="relative">
              <Label htmlFor="search-term">Buscar</Label>
              <Search className="absolute left-3 top-[calc(50%+0.3rem)] -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-term"
                type="search"
                placeholder="Prenda, categoría, nota, ID..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 w-full mt-1"
              />
            </div>
             <div>
                <Label htmlFor="user-filter">Filtrar por Usuario</Label>
                <Select value={userFilter} onValueChange={(value) => { setUserFilter(value === 'todos' ? '' : value); setCurrentPage(1); }}>
                    <SelectTrigger id="user-filter" className="mt-1">
                        <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Todos los usuarios" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos los usuarios</SelectItem>
                        {uniqueUsers.map(user => (
                            <SelectItem key={user} value={user} className="capitalize">{user}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
              <Label htmlFor="date-start">Fecha Desde</Label>
              <Input id="date-start" type="date" value={dateFilter.start} onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="date-end">Fecha Hasta</Label>
              <Input id="date-end" type="date" value={dateFilter.end} onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))} className="mt-1" />
            </div>
          </div>

          {paginatedEntries.length > 0 ? (
            <>
              <ScrollArea className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer hover:bg-muted/80" onClick={() => handleSort('date')}>
                        Fecha Ingreso {sortColumn === 'date' && (sortDirection === 'asc' ? '▲' : '▼')}
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/80" onClick={() => handleSort('recordedAt')}>
                        Fecha Registro {sortColumn === 'recordedAt' && (sortDirection === 'asc' ? '▲' : '▼')}
                      </TableHead>
                       <TableHead className="cursor-pointer hover:bg-muted/80" onClick={() => handleSort('enteredBy')}>
                        Registrado Por {sortColumn === 'enteredBy' && (sortDirection === 'asc' ? '▲' : '▼')}
                      </TableHead>
                      <TableHead className="text-right cursor-pointer hover:bg-muted/80" onClick={() => handleSort('totalQuantityAdded')}>
                        Cant. Total {sortColumn === 'totalQuantityAdded' && (sortDirection === 'asc' ? '▲' : '▼')}
                      </TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEntries.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-muted/50">
                        <TableCell>{formatDate(entry.date)}</TableCell>
                        <TableCell>{formatDate(entry.recordedAt, true)}</TableCell>
                        <TableCell className="capitalize">{entry.enteredBy}</TableCell>
                        <TableCell className="text-right font-semibold">{entry.totalQuantityAdded}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground" title={entry.notes}>{entry.notes || '-'}</TableCell>
                        <TableCell className="text-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="shadow-sm hover:shadow" onClick={() => setSelectedEntryDetails(entry.items)}>
                                <Eye className="mr-1.5 h-3.5 w-3.5" /> Ver Detalles
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalles del Ingreso de Stock (ID: {entry.id.slice(-6)})</DialogTitle>
                                <DialogDescription>
                                  Fecha de Ingreso: {formatDate(entry.date)} | Registrado por: <span className="capitalize">{entry.enteredBy}</span>
                                </DialogDescription>
                              </DialogHeader>
                              <ScrollArea className="max-h-[60vh] mt-4">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Prenda</TableHead>
                                      <TableHead>Categoría</TableHead>
                                      <TableHead>Talla</TableHead>
                                      <TableHead className="text-right">Cantidad Ingresada</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedEntryDetails?.map((item, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>{item.uniformName}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell>{item.size}</TableCell>
                                        <TableCell className="text-right">{item.quantityAdded}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          ) : (
             <div className="h-40 flex flex-col items-center justify-center text-center border rounded-md">
              <History className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-lg font-medium text-muted-foreground">No hay ingresos de stock registrados.</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || dateFilter.start || dateFilter.end || userFilter ? "Prueba con otros filtros o términos de búsqueda." : "Cuando ingreses stock, aparecerá aquí."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

