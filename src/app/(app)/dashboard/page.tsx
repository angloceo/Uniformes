"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Archive, BarChart3, DollarSign, PackagePlus, ShoppingCart, Users, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { initialUniforms, mockSales, type Uniform, type Sale } from "@/lib/mock-data";

const getDashboardData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const today = new Date().toISOString().split('T')[0];
  const salesToday = mockSales.filter(sale => sale.date.startsWith(today));
  const totalSalesToday = salesToday.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const itemsSoldCount = salesToday.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);


  let criticalInventoryCount = 0;
  initialUniforms.forEach(uniform => {
    uniform.sizes.forEach(size => {
      if (size.stock <= size.lowStockThreshold && size.stock > 0) {
        criticalInventoryCount++;
      }
    });
  });

  return {
    totalSalesToday,
    itemsSoldToday: itemsSoldCount, // Use itemsSoldCount calculated above
    criticalInventoryCount,
    recentActivity: [ // Sample recent activity
      { type: "Venta", description: "Venta #00124 registrada", time: "Hace 10 minutos", icon: ShoppingCart },
      { type: "Inventario", description: "Stock de 'Camiseta Polo (Hombre) - M' bajo", time: "Hace 1 hora", icon: AlertTriangle },
      { type: "Ingreso", description: "Ingreso de 20 'Camiseta Deporte - S'", time: "Hace 3 horas", icon: PackagePlus },
    ]
  };
};

interface DashboardStats {
  totalSalesToday: number;
  itemsSoldToday: number;
  criticalInventoryCount: number;
  recentActivity: { type: string, description: string, time: string, icon: React.ElementType }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getDashboardData();
      setStats(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Panel de Control</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
             <Card key={i} className="shadow-lg animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-6 w-6 bg-muted rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-1"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
         <Card className="shadow-lg animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/4"></div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, i) => ( <div key={i} className="h-5 bg-muted rounded w-3/4"></div> ))}
            </CardContent>
          </Card>
      </div>
    );
  }

  const summaryCards = [
    { title: "Ventas del Día", value: `COP ${stats.totalSalesToday.toLocaleString('es-CO')}`, description: `${stats.itemsSoldToday} prendas vendidas hoy`, icon: DollarSign, color: "text-green-500" },
    { title: "Inventario Crítico", value: `${stats.criticalInventoryCount} Ítems`, description: "Prendas con bajo stock", icon: AlertTriangle, color: "text-orange-500" },
    { title: "Total Prendas (Tipos)", value: `${initialUniforms.length} Tipos`, description: "Variedad de uniformes disponibles", icon: Archive, color: "text-blue-500" },
  ];

  const quickActions = [
    { label: "Registrar Venta", href: "/sales/new", icon: ShoppingCart, variant: "default" as const },
    { label: "Ver Inventario", href: "/inventory", icon: Archive, variant: "outline" as const },
    { label: "Ingresar Stock", href: "/inventory/add", icon: PackagePlus, variant: "outline" as const },
    { label: "Ver Reportes", href: "/reports", icon: BarChart3, variant: "outline" as const, disabled: true },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Panel de Control</h1>
      
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {quickActions.map((action) => (
              <Link href={action.href} key={action.label} passHref>
                <Button variant={action.variant} className="w-full h-20 flex-col gap-1 text-sm shadow hover:shadow-md" disabled={action.disabled}>
                  <action.icon className="h-6 w-6 mb-1" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
      
      <section>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Actividad Reciente</CardTitle>
            <CardDescription>Últimos movimientos en el sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <li key={index} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted transition-colors">
                  <activity.icon className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </li>
              ))}
               {stats.recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay actividad reciente.</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
