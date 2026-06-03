import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories, globalConfigs } from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

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
  console.log("Seeding global configurations...");
  try {
    await db.insert(globalConfigs).values({
      key: "dolar_charmarket",
      value: "1000",
    });
    console.log("Inserted dolar_charmarket");
  } catch (error) {
    console.log("Failed to insert dolar_charmarket (maybe already exists)");
  }

  console.log("Seeding categories...");
  const data = categoryNames.map((name) => ({
    name,
    slug: toKebabCase(name),
  }));

  for (const cat of data) {
    try {
      await db.insert(categories).values(cat);
      console.log(`Inserted ${cat.name}`);
    } catch (error) {
      console.log(`Failed to insert ${cat.name} (maybe already exists)`);
    }
  }

  console.log("Seeding finished.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding:", err);
  process.exit(1);
});
