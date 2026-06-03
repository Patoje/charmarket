import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { products, categories } from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const connectionString = process.env.DATABASE_URL!;
const sqlConnection = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlConnection);

const categoryNames = [
  "Accesorios",
  "Booster Box",
  "Booster Pack",
  "Booster Bundle",
  "Collection Box",
  "ETB",
];

async function cleanAndSeed() {
  console.log("Cleaning old products to avoid FK constraints...");
  await db.delete(products);

  console.log("Cleaning old categories...");
  await db.delete(categories);

  console.log("Inserting new pure categories...");
  for (const name of categoryNames) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    try {
      await db.insert(categories).values({ name, slug });
      console.log(`Inserted ${name}`);
    } catch (e) {
      console.log(`Failed to insert ${name}`);
    }
  }

  console.log("Done.");
  process.exit(0);
}

cleanAndSeed();
