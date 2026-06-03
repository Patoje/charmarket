import { db } from "@/lib/db";
import { orders, orderItems, products, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { OrderActions } from "./OrderActions";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  // Consultar las órdenes
  const allOrders = await db
    .select({
      id: orders.id,
      status: orders.status,
      totalUsd: orders.totalUsd,
      createdAt: orders.createdAt,
      userEmail: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));

  // Consultar items de órdenes
  const allItems = await db
    .select({
      orderId: orderItems.orderId,
      quantity: orderItems.quantity,
      priceUsdSnapshot: orderItems.priceUsdSnapshot,
      productName: products.name,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id));

  // Agrupar items por orden
  const itemsByOrder = allItems.reduce((acc: any, item) => {
    if (!acc[item.orderId]) acc[item.orderId] = [];
    acc[item.orderId].push(item);
    return acc;
  }, {});

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20">Pendiente</Badge>;
      case "paid": return <Badge variant="outline" className="text-green-500 border-green-500/50 bg-green-500/10 hover:bg-green-500/20">Aprobada</Badge>;
      case "cancelled": return <Badge variant="outline" className="text-red-500 border-red-500/50 bg-red-500/10 hover:bg-red-500/20">Denegada</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Gestión de Órdenes</h1>
          <p className="text-muted-foreground mt-2">Administra los pedidos de WhatsApp, aprueba ventas y descuenta el stock de tu inventario.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {allOrders.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground bg-card">
            No hay órdenes registradas todavía. Cuando los clientes compren, aparecerán aquí.
          </div>
        ) : (
          allOrders.map((order) => {
            const items = itemsByOrder[order.id] || [];
            return (
              <div key={order.id} className="p-6 border border-border/50 bg-card rounded-lg flex flex-col md:flex-row gap-6 justify-between items-start md:items-center shadow-sm">
                <div className="space-y-3 flex-1 w-full">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xl tracking-tight">Orden #{order.id}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                    <div>
                      <p className="text-muted-foreground">Cliente</p>
                      <p className="font-medium">{order.userEmail || "Cliente de WhatsApp"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fecha</p>
                      <p className="font-medium">{order.createdAt.toLocaleString("es-AR")}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-muted/30 border border-border/50 rounded-md">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex justify-between">
                      <span>Items del pedido</span>
                      <span>Subtotal</span>
                    </p>
                    <ul className="space-y-2">
                      {items.map((item: any, idx: number) => {
                        const subtotal = Number(item.priceUsdSnapshot) * item.quantity;
                        return (
                          <li key={idx} className="text-sm flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                              <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs font-mono font-bold">{item.quantity}x</span>
                              <span className="font-medium">{item.productName || "Producto no encontrado"}</span>
                              <span className="text-muted-foreground text-xs">(${item.priceUsdSnapshot} c/u)</span>
                            </div>
                            <span className="text-muted-foreground font-medium ml-auto">
                              ${subtotal.toFixed(2)} USD
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-6 min-w-[200px] border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6">
                  <div className="text-right w-full">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total a cobrar</p>
                    <p className="text-3xl font-black text-primary">${order.totalUsd} <span className="text-lg font-bold text-muted-foreground">USD</span></p>
                  </div>
                  
                  {order.status === "pending" && (
                    <div className="w-full flex justify-end">
                      <OrderActions orderId={order.id} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
