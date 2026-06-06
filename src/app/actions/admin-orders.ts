"use server";

import { db } from "@/lib/db";
import { orders, products, orderItems } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getOrders() {
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  
  // Para cada orden, traer sus items
  const ordersWithItems = await Promise.all(allOrders.map(async (o) => {
    const items = await db.select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      priceUsdSnapshot: orderItems.priceUsdSnapshot,
      productName: products.name,
      productId: products.id
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, o.id));
    
    return { ...o, items };
  }));
  
  return ordersWithItems;
}

export async function acceptOrder(orderId: number) {
  try {
    // 1. Verificar si la orden existe y está pendiente
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return { success: false, error: "Orden no encontrada" };
    if (order.status !== "pending") return { success: false, error: "La orden ya fue procesada" };

    // 2. Traer los items
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

    // 3. Validar stock de todos los productos primero
    for (const item of items) {
      const [product] = await db.select({ stock: products.stock, name: products.name }).from(products).where(eq(products.id, item.productId));
      if (!product || product.stock < item.quantity) {
        return { 
          success: false, 
          error: `Stock insuficiente para "${product?.name || "un producto"}". Stock actual: ${product?.stock || 0}, Solicitado: ${item.quantity}.` 
        };
      }
    }

    // 4. Descontar el stock secuencialmente
    for (const item of items) {
      await db.update(products)
        .set({ stock: sql`${products.stock} - ${item.quantity}` })
        .where(eq(products.id, item.productId));
    }

    // 5. Marcar como aceptada
    await db.update(orders)
      .set({ status: "accepted" })
      .where(eq(orders.id, orderId));

    revalidatePath("/admin", "layout");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Error al aceptar orden:", error);
    return { success: false, error: "Error interno al aceptar el pedido" };
  }
}

export async function rejectOrder(orderId: number) {
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return { success: false, error: "Orden no encontrada" };
    if (order.status !== "pending") return { success: false, error: "La orden ya fue procesada" };

    // Marcar como rechazada (no descuenta stock)
    await db.update(orders)
      .set({ status: "rejected" })
      .where(eq(orders.id, orderId));
      
    revalidatePath("/admin", "layout");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Error al rechazar orden:", error);
    return { success: false, error: "Error interno al rechazar el pedido" };
  }
}
