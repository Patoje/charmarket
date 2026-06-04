import { db } from './src/lib/db';
import { products } from './src/db/schema';
import { eq } from 'drizzle-orm';
async function main() {
  const allProducts = await db.select().from(products).limit(5);
  console.log("BEFORE:", allProducts.map(p => ({id: p.id, name: p.name, subCategory: p.subCategory})));
  
  if (allProducts.length > 0) {
    const id = allProducts[0].id;
    await db.update(products).set({ subCategory: "Especial" }).where(eq(products.id, id));
    console.log("UPDATED", id);
    const updated = await db.select().from(products).where(eq(products.id, id));
    console.log("AFTER:", updated[0].subCategory);
  }
}
main();
