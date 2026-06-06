"use server";

import { db } from "@/lib/db";
import { orders, orderItems } from "@/db/schema";
import { revalidatePath } from "next/cache";


export async function createCheckoutOrder(
  customerName: string,
  totalUsd: number,
  totalArs: number,
  items: { productId: number; quantity: number; priceUsdSnapshot: number }[]
) {
  try {
    // Generar un número de orden único y corto (ej. ORD-A1B2C)
    const orderNumber = "ORD-" + Math.random().toString(36).substring(2, 7).toUpperCase();
    
    // 1. Insertar la Orden
    const [newOrder] = await db.insert(orders).values({
      orderNumber,
      customerName,
      totalUsd: totalUsd.toString(),
      totalArsSnapshot: totalArs.toString(),
      status: "pending",
    }).returning({ id: orders.id });

    // 2. Insertar los Items de la orden
    if (items.length > 0) {
      const orderItemsData = items.map((item) => ({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        priceUsdSnapshot: item.priceUsdSnapshot.toString(),
      }));

      await db.insert(orderItems).values(orderItemsData);
    }

    revalidatePath("/admin", "layout");

    return { success: true, orderNumber };
  } catch (error) {
    console.error("Error al crear la orden:", error);
    return { success: false, error: "Ocurrió un error al procesar el pedido" };
  }
}
