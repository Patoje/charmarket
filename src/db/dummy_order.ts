import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { orders, orderItems, products } from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function main() {
  console.log("Creando orden dummy...");

  // Agarra un par de productos al azar
  const allProducts = await db.select().from(products).limit(2);
  
  if (allProducts.length === 0) {
    console.log("No hay productos en la base de datos para crear la orden dummy.");
    process.exit(1);
  }

  // Obtenemos un usuario dummy (el admin)
  // Como no sabemos si hay usuarios, ponemos userId 1, asumiendo que el admin existe
  // O podemos insertarlo. Mejor asumiendo 1, y si falla lo atrapamos.
  
  try {
    // 1. Aseguramos que haya un usuario
    let [user] = await db.select().from(users).limit(1);
    
    if (!user) {
      const [newUser] = await db.insert(users).values({
        email: "admin@charmarket.com.ar",
        name: "Admin",
        role: "admin",
      }).returning();
      user = newUser;
    }

    // 2. Creamos la orden
    const [newOrder] = await db.insert(orders).values({
      userId: user.id,
      status: "pending",
      totalUsd: "150.00",
    }).returning();

    // 3. Insertamos los items
    await db.insert(orderItems).values([
      {
        orderId: newOrder.id,
        productId: allProducts[0].id,
        quantity: 1,
        priceUsdSnapshot: "100.00",
      },
      ...(allProducts.length > 1 ? [{
        orderId: newOrder.id,
        productId: allProducts[1].id,
        quantity: 2,
        priceUsdSnapshot: "25.00",
      }] : []),
    ]);
    
    console.log("Orden dummy creada correctamente.");
  } catch (err: any) {
    console.error("Error al crear la orden dummy:", err.message);
  }

  process.exit(0);
}

main();
