import { db } from "./src/lib/db";
import { products, categories } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const collectionBoxCat = await db.select().from(categories).where(eq(categories.name, "Collection Box"));
  if (collectionBoxCat.length > 0) {
    await db.update(products)
      .set({ subCategory: null })
      .where(eq(products.categoryId, collectionBoxCat[0].id));
    console.log("Fixed Collection Box subcategories.");
  }
  process.exit(0);
}
main();
