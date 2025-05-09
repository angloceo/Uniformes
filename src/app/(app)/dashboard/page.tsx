
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Archive, BarChart3, DollarSign, PackagePlus, ShoppingCart, Users, AlertTriangle, CheckCircle, Clock, PieChartIcon, BarChartIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { initialUniforms as defaultUniforms, mockSales as defaultMockSales, type Uniform, type Sale, setMockSales } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer } from 'recharts';


// Function to safely parse JSON from localStorage
const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const storedValue = localStorage.getItem(key);
  if (storedValue) {
    try {
      return JSON.parse(storedValue) as T;
    } catch (error) {
      console.error(`Error parsing localStorage item ${key}:`, error);
      localStorage.removeItem(key);
      return defaultValue;
    }
  }
  return defaultValue;
};


const getDashboardData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const currentUniforms = getFromLocalStorage<Uniform[]>('updatedUniformsData', defaultUniforms);
  const currentSales = getFromLocalStorage<Sale[]>('mockSales', defaultMockSales);
  
  if (typeof window !== 'undefined') {
    const storedSales = localStorage.getItem('mockSales');
    if (storedSales) {
        try {
            setMockSales(JSON.parse(storedSales));
        } catch (e) {
            console.error("Failed to parse mockSales from localStorage on dashboard", e)
        }
    }
  }
  
  const todayISO = new Date().toISOString().split('T')[0];
  const salesToday = currentSales.filter(sale => sale.date.startsWith(todayISO));
  const totalSalesToday = salesToday.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const itemsSoldCount = salesToday.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

  let criticalInventoryCount = 0;
  currentUniforms.forEach(uniform => {
    uniform.sizes.forEach(size => {
      if (size.stock > 0 && size.stock <= size.lowStockThreshold) {
        criticalInventoryCount++;
      }
    });
  });

  const recentActivityFromSales = salesToday.slice(-2).map(sale => ({
    type: "Venta",
    description: `Venta #${sale.id.slice(-5)} registrada (${sale.customerName})`,
    time: new Date(sale.date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    icon: ShoppingCart
  }));

  const sampleInventoryActivity = currentUniforms
    .flatMap(u => u.sizes.map(s => ({ ...s, name: u.name })))
    .filter(s => s.stock > 0 && s.stock <= s.lowStockThreshold)
    .slice(0, 1) 
    .map(item => ({
      type: "Inventario",
      description: `Stock de '${item.name} - ${item.size}' bajo (${item.stock} unidades)`,
      time: "Reciente",
      icon: AlertTriangle,
    }));

  const combinedActivity = [...recentActivityFromSales, ...sampleInventoryActivity].slice(0,3);

  // Chart Data Preparation
  // Daily Sales for the last 7 days
  const dailySalesChartData: { date: string; total: number }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD for matching
    const displayDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    
    let dailyTotal = 0;
    currentSales.forEach(sale => {
      if (sale.date.startsWith(dateKey)) {
        dailyTotal += sale.totalAmount;
      }
    });
    dailySalesChartData.push({ date: displayDate, total: dailyTotal });
  }

  // Top Selling Uniform Types (Top 5)
  const salesByUniform: Record<string, { name: string; quantity: number }> = {};
  currentSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!salesByUniform[item.uniformName]) {
        salesByUniform[item.uniformName] = { name: item.uniformName, quantity: 0 };
      }
      salesByUniform[item.uniformName].quantity += item.quantity;
    });
  });

  const topSellingUniformsChartData = Object.values(salesByUniform)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    totalSalesToday,
    itemsSoldToday: itemsSoldCount,
    criticalInventoryCount,
    recentActivity: combinedActivity.length > 0 ? combinedActivity : [
        { type: "Sistema", description: "No hay actividad reciente para mostrar.", time: "", icon: CheckCircle }
    ],
    dailySalesChartData,
    topSellingUniformsChartData,
  };
};

interface DashboardStats {
  totalSalesToday: number;
  itemsSoldToday: number;
  criticalInventoryCount: number;
  recentActivity: { type: string, description: string, time: string, icon: React.ElementType }[];
  dailySalesChartData: { date: string; total: number }[];
  topSellingUniformsChartData: { name: string; quantity: number }[];
}

const dailySalesChartConfig = {
  total: {
    label: "Ventas (COP)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const topSellingUniformsConfig = {
   quantity: {
    label: "Cantidad",
   },
} satisfies ChartConfig;

const PIE_CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];


export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const fetchData = async () => {
        setLoading(true);
        const data = await getDashboardData();
        setStats(data);
        setLoading(false);
      };
      fetchData();
      const intervalId = setInterval(fetchData, 30000); 
      return () => clearInterval(intervalId);
    }
  }, [mounted]);

  if (!mounted || loading || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Panel de Control</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2"> {/* Changed lg:grid-cols-3 to lg:grid-cols-2 */}
          {[...Array(2)].map((_, i) => ( // Now 2 summary cards
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
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
                <Card key={`chart-skeleton-${i}`} className="shadow-lg animate-pulse">
                    <CardHeader>
                        <div className="h-6 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-3/4 mt-1"></div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[250px] w-full" />
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
      
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-2"> {/* Adjusted for 2 cards */}
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

      <section className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
                <BarChartIcon className="mr-2 h-5 w-5 text-primary" />
                Ventas Diarias (Últimos 7 días)
            </CardTitle>
            <CardDescription>Total de ventas realizadas cada día.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.dailySalesChartData.reduce((sum, day) => sum + day.total, 0) > 0 ? (
                <ChartContainer config={dailySalesChartConfig} className="h-[300px] w-full">
                <BarChart accessibilityLayer data={stats.dailySalesChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => ` ${value / 1000}k`} />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} barSize={30}/>
                </BarChart>
                </ChartContainer>
            ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No hay datos de ventas para los últimos 7 días.
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
                <PieChartIcon className="mr-2 h-5 w-5 text-primary" />
                Prendas Más Vendidas (Top 5)
            </CardTitle>
            <CardDescription>Distribución de las prendas más populares por cantidad vendida.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {stats.topSellingUniformsChartData.length > 0 ? (
                 <ChartContainer config={topSellingUniformsConfig} className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                        <Pie
                            data={stats.topSellingUniformsChartData}
                            dataKey="quantity"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                            {stats.topSellingUniformsChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsLegend content={<ChartLegendContent nameKey="name" />} wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No hay datos de ventas para mostrar.
                </div>
            )}
          </CardContent>
        </Card>
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
