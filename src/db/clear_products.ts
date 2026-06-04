import { db } from "../lib/db";
import { products, orderItems, orders } from "./schema";

async function main() {
  console.log("Limpiando ordenes...");
  await db.delete(orderItems);
  await db.delete(orders);
  console.log("Limpiando todos los productos...");
  await db.delete(products);
  console.log("Productos eliminados correctamente.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Error limpiando productos:", e);
  process.exit(1);
});
