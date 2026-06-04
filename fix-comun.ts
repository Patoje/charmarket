import { db } from "./src/lib/db";
import { products, categories } from "./src/db/schema";
import { eq, and, isNull } from "drizzle-orm";

async function main() {
  const bbCat = await db.select().from(categories).where(eq(categories.name, "Booster Box"));
  
  if (bbCat.length > 0) {
    const p = await db.select({ id: products.id, name: products.name, subCategory: products.subCategory })
      .from(products)
      .where(and(
        eq(products.categoryId, bbCat[0].id),
        eq(products.language, "Japonés"),
        isNull(products.subCategory)
      ));
      
    console.log("Products to update to Común:", p);
    
    if (p.length > 0) {
      await db.update(products)
        .set({ subCategory: "Común" })
        .where(and(
          eq(products.categoryId, bbCat[0].id),
          eq(products.language, "Japonés"),
          isNull(products.subCategory)
        ));
      console.log("Updated to Común");
    }
  }
  process.exit(0);
}
main();
