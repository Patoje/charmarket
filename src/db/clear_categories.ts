import { db } from "../lib/db";
import { categories, products } from "./schema";
import { inArray, notInArray, eq } from "drizzle-orm";

async function main() {
  console.log("Obteniendo categorias validas...");
  const validNames = ["Accesorios", "Booster Box", "Booster Pack", "Booster Bundle", "Collection Box", "ETB", "General"];
  
  // Encontrar qué categorías están en la BD y cuáles no
  const allCats = await db.select().from(categories);
  
  const toDelete = allCats.filter(c => !validNames.includes(c.name));
  
  if (toDelete.length === 0) {
    console.log("No hay categorias basura para eliminar.");
    process.exit(0);
  }

  const idsToDelete = toDelete.map(c => c.id);
  console.log(`Eliminando ${idsToDelete.length} categorias basura...`);
  
  // Cambiar los productos que tengan estas categorias a "General"
  let generalCat = allCats.find(c => c.name === "General");
  if (!generalCat) {
    const [newGeneral] = await db.insert(categories).values({ name: "General", slug: "general" }).returning();
    generalCat = newGeneral;
  }
  
  await db.update(products).set({ categoryId: generalCat.id }).where(inArray(products.categoryId, idsToDelete));
  
  await db.delete(categories).where(inArray(categories.id, idsToDelete));
  console.log("Categorias basura eliminadas.");
  process.exit(0);
}

main().catch(e => {
  console.error("Error", e);
  process.exit(1);
});
