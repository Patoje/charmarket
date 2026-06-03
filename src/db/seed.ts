import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { categories, globalConfigs } from "./schema";
import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const sqlConnection = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlConnection);

const toKebabCase = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const categoryNames = [
  "ETB",
  "Booster Box",
  "Booster Pack",
  "Booster Bundle",
  "Collection Box",
  "Accesorios",
];

async function seed() {
  console.log("⏳ Iniciando proceso de Seeding...");

  try {
    // 1. VALIDACIÓN PREVIA DE CONEXIÓN
    await db.execute(sql`SELECT 1`);
    console.log("✅ Conexión a la base de datos establecida correctamente.\n");
  } catch (error) {
    console.error("❌ Falló la conexión a PostgreSQL. Verifica tu DATABASE_URL.");
    console.error(error);
    process.exit(1);
  }

  try {
    // 2. SIN TRANSACCIÓN PARA NEON HTTP
    const tx = db;

      // 3. UPSERT Y LOGGING: globalConfigs
      const configData = { key: "dolar_charmarket", value: "1000" };
      const configInserted = await tx.insert(globalConfigs)
        .values(configData)
        .onConflictDoNothing({ target: globalConfigs.key })
        .returning();
      
      if (configInserted.length > 0) {
        console.log(`✅ [GlobalConfigs] Insertado: 'dolar_charmarket' = 1000`);
      } else {
        console.log(`⏭️ [GlobalConfigs] Saltado: 'dolar_charmarket' ya existía.`);
      }

      // 4. UPSERT Y LOGGING: Categorías
      const categoriesData = categoryNames.map((name) => ({
        name,
        slug: toKebabCase(name),
      }));

      // Inserción en bloque (batch insert) con Upsert
      const categoriesInserted = await tx.insert(categories)
        .values(categoriesData)
        .onConflictDoNothing({ target: categories.slug })
        .returning();

      const skippedCount = categoriesData.length - categoriesInserted.length;
      console.log(`\n✅ [Categorías] Insertadas: ${categoriesInserted.length}`);
      console.log(`⏭️ [Categorías] Saltadas (ya existían): ${skippedCount}`);
      
      if (categoriesInserted.length > 0) {
        console.log("   Nuevas categorías agregadas:", categoriesInserted.map(c => c.name).join(", "));
      }

    console.log("\n🎉 Seeding finalizado exitosamente.");
  } catch (err) {
    console.error("\n❌ Error durante la transacción de seeding. Haciendo ROLLBACK...", err);
    process.exit(1);
  }
}

seed();
