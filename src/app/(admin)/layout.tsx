import Link from "next/link";
import { LayoutDashboard, Settings, Package, LogOut, ShoppingCart, BarChart3 } from "lucide-react";
import { logout } from "@/app/actions/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-primary">Charmarket Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 p-3 hover:bg-accent rounded-md transition-colors text-sm font-medium">
            <Settings size={20} />
            Configuración Dólar
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 p-3 hover:bg-accent rounded-md transition-colors text-sm font-medium">
            <Package size={20} />
            Inventario
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 p-3 hover:bg-accent rounded-md transition-colors text-sm font-medium">
            <ShoppingCart size={20} />
            Órdenes
          </Link>
          <Link href="/admin/stats" className="flex items-center gap-3 p-3 hover:bg-accent rounded-md transition-colors text-sm font-medium">
            <BarChart3 size={20} />
            Estadísticas
          </Link>
        </nav>
        
        <div className="p-4 border-t border-border/50">
          <form action={logout}>
            <button type="submit" className="flex w-full items-center gap-3 p-3 text-destructive hover:bg-destructive/10 rounded-md transition-colors text-sm font-bold tracking-wide uppercase">
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
