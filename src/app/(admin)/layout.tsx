import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { SidebarNav } from "./SidebarNav";
import { AdminSidebarWrapper } from "./AdminSidebarWrapper";
import { db } from "@/lib/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pendingOrders = await db.select({ id: orders.id }).from(orders).where(eq(orders.status, "pending"));
  const pendingCount = pendingOrders.length;

  return (
    <AdminSidebarWrapper
      pendingCount={pendingCount}
      logoutAction={logout}
    >
      {children}
    </AdminSidebarWrapper>
  );
}
