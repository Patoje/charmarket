import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { SidebarNav } from "./SidebarNav";
import { db } from "@/lib/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pendingOrders = await db.select({ id: orders.id }).from(orders).where(eq(orders.status, "pending"));
  const pendingCount = pendingOrders.length;
  return (
    <div className="flex h-screen bg-muted/40 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-card border-r flex flex-col flex-shrink-0">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-primary">Charmarket Admin</h2>
        </div>
        <SidebarNav pendingOrdersCount={pendingCount} />
        
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
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
