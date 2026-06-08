"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Package, ShoppingCart, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  pendingOrdersCount: number;
  /** Called when a nav item is clicked — used to close mobile sidebar */
  onNavClick?: () => void;
}

export function SidebarNav({ pendingOrdersCount, onNavClick }: SidebarNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Config. Dólar", icon: Settings },
    { href: "/admin/products", label: "Inventario", icon: Package },
    { href: "/admin/orders", label: "Órdenes", icon: ShoppingCart },
  ];

  return (
    <nav className="flex-1 p-3 space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={cn(
              "flex items-center justify-between p-3 rounded-md transition-colors text-sm font-medium",
              isActive
                ? "bg-primary/20 text-primary border border-primary/30"
                : "hover:bg-accent text-foreground"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <item.icon
                size={18}
                className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground")}
              />
              <span className={cn("truncate", isActive ? "font-bold" : "")}>
                {item.label}
              </span>
            </div>
            {item.href === "/admin/orders" && pendingOrdersCount > 0 && (
              <div className="flex items-center justify-center w-5 h-5 bg-red-500 rounded-full animate-pulse shrink-0 ml-2">
                <AlertCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
