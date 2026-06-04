import { db } from "./src/lib/db";
import { products, categories } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const all = await db.select({
    name: products.name,
    categoryName: categories.name,
    subCategory: products.subCategory,
    language: products.language
  })
  .from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .where(eq(categories.name, "Collection Box"));
  
  console.log(all);
  process.exit(0);
}
main();
