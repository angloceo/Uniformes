
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ShoppingCart,
  Archive,
  PackagePlus,
  DollarSign,
  Boxes,
  LineChart,
  ReceiptText,
  LogOut,
  Cog,
  ShieldCheck, // For general admin/settings
  TrendingUp, // For profit management
  Settings2, // More specific for settings
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppLogo } from "./AppLogo";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  submenu?: NavItem[];
  adminOnly?: boolean;
}

const navItemsBase: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Ventas",
    href: "/sales", // Parent path for active state
    icon: DollarSign,
    submenu: [
      { title: "Registrar Venta", href: "/sales/new", icon: ShoppingCart },
      { title: "Historial de Ventas", href: "/sales/history", icon: ReceiptText }, 
    ],
  },
  {
    title: "Inventario",
    href: "/inventory", // Parent path for active state
    icon: Boxes,
    submenu: [
      { title: "Ver Stock", href: "/inventory", icon: Archive },
      { title: "Ingresar Stock", href: "/inventory/add", icon: PackagePlus },
    ],
  },
  {
    title: "Reportes",
    href: "/reports",
    icon: LineChart,
    disabled: true, 
  },
  {
    title: "Administración",
    href: "/admin", // Parent path for active state
    icon: ShieldCheck, 
    adminOnly: true,
    submenu: [
        { title: "Configuraciones", href: "/admin/settings", icon: Settings2 },
        { title: "Costos y Ganancias", href: "/admin/profit-management", icon: TrendingUp },
    ]
  },
];


export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setUserRole(localStorage.getItem('userRole'));
    }
  }, []);

  const handleLogout = () => {
    if (mounted) {
      localStorage.removeItem('userRole');
    }
    router.push('/login');
  };
  
  const filteredNavItems = navItemsBase.filter(item => {
    if (item.adminOnly) {
      return userRole === 'admin';
    }
    return true;
  });

  if (!mounted) {
     return null; 
  }

  return (
    <>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex h-16 items-center justify-start border-b border-sidebar-border px-4 shrink-0">
           <Link href="/dashboard" className="flex items-center gap-2">
             {/* Use default AppLogo for application branding */}
             <AppLogo iconClassName="h-7 w-7" textClassName="text-xl" />
           </Link>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
        <SidebarMenu>
          {filteredNavItems.map((item) =>
            item.submenu ? (
              <SidebarMenuItem key={item.title} className="relative">
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{children: item.title, side: 'right', align: 'center' }}
                  className="justify-between" // Keep for potential arrow if Radix supports it natively
                  disabled={item.disabled}
                  aria-disabled={item.disabled}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {item.submenu.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <Link href={subItem.href} passHref legacyBehavior>
                        <SidebarMenuSubButton
                          isActive={pathname === subItem.href}
                          disabled={subItem.disabled}
                          aria-disabled={subItem.disabled}
                        >
                          <subItem.icon className="h-4 w-4 mr-1.5 text-sidebar-accent-foreground" />
                          <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                      </Link>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem key={item.title}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    disabled={item.disabled}
                    aria-disabled={item.disabled}
                    tooltip={{children: item.title, side: 'right', align: 'center' }}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
        </div>
        <Separator className="my-2 bg-sidebar-border" />
        <div className="p-2 mt-auto shrink-0">
           {userRole && (
            <div className="px-2 py-1 mb-2 text-xs text-sidebar-foreground/70">
              Rol: <span className="font-semibold capitalize">{userRole}</span>
            </div>
          )}
          <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </>
  );
}
