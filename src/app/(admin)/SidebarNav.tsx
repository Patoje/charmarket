"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Package, ShoppingCart, BarChart3, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarNav({ pendingOrdersCount }: { pendingOrdersCount: number }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Configuración Dólar", icon: Settings },
    { href: "/admin/products", label: "Inventario", icon: Package },
    { href: "/admin/orders", label: "Órdenes", icon: ShoppingCart },
    { href: "/admin/stats", label: "Estadísticas", icon: BarChart3 },
  ];

  return (
    <nav className="flex-1 p-4 space-y-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={cn(
              "flex items-center justify-between p-3 rounded-md transition-colors text-sm font-medium",
              isActive ? "bg-primary/20 text-primary border border-primary/30" : "hover:bg-accent text-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className={isActive ? "text-primary" : "text-muted-foreground"} />
              <span className={isActive ? "font-bold" : ""}>{item.label}</span>
            </div>
            {item.href === "/admin/orders" && pendingOrdersCount > 0 && (
              <div className="flex items-center justify-center w-5 h-5 bg-red-500 rounded-full animate-pulse">
                <AlertCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
