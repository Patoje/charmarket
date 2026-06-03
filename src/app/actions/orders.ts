"use server";

import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function approveOrder(orderId: number) {
  try {
    await db.transaction(async (tx) => {
      // 1. Verificar que la orden esté pendiente
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId));
      if (!order) throw new Error("Orden no encontrada");
      if (order.status !== "pending") throw new Error("La orden ya fue procesada");

      // 2. Obtener los items
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));

      // 3. Descontar stock por cada item
      for (const item of items) {
        await tx.update(products)
          .set({ stock: sql`${products.stock} - ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }

      // 4. Actualizar estado de la orden
      await tx.update(orders)
        .set({ status: "paid" })
        .where(eq(orders.id, orderId));
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/products"); // Actualiza el inventario también
    return { success: true };
  } catch (error: any) {
    console.error("Error approving order:", error);
    return { success: false, error: error.message || "Error al aprobar la orden" };
  }
}

export async function cancelOrder(orderId: number) {
  try {
    await db.update(orders)
      .set({ status: "cancelled" })
      .where(eq(orders.id, orderId));
      
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    console.error("Error cancelling order:", error);
    return { success: false, error: error.message || "Error al cancelar la orden" };
  }
}
