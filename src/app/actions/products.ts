"use server";

import { db } from "@/lib/db";
import { products, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  const allProducts = await db.select({
    id: products.id,
    name: products.name,
    description: products.description,
    imageUrl: products.imageUrl,
    categoryId: products.categoryId,
    categoryName: categories.name,
    language: products.language,
    priceUsdMinorista: products.priceUsdMinorista,
    priceUsdMayorista: products.priceUsdMayorista,
    stock: products.stock,
    isActive: products.isActive,
  })
  .from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .orderBy(desc(products.id));

  return allProducts;
}

export async function getCategories() {
  return await db.select().from(categories);
}

export async function saveProduct(formData: FormData) {
  try {
    const id = formData.get("productId") ? parseInt(formData.get("productId") as string) : null;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const categoryId = parseInt(formData.get("categoryId") as string);
    const language = formData.get("language") as string;
    const priceUsdMinorista = formData.get("priceUsdMinorista") as string;
    const priceUsdMayorista = formData.get("priceUsdMayorista") as string;
    const stock = parseInt(formData.get("stock") as string);

    if (!name || !categoryId || !language || !priceUsdMinorista || !priceUsdMayorista) {
      return { error: "Todos los campos obligatorios deben completarse" };
    }

    const values = {
      name,
      description,
      imageUrl: imageUrl || null,
      categoryId,
      language,
      priceUsdMinorista,
      priceUsdMayorista,
      stock: isNaN(stock) ? 0 : stock,
      isActive: true,
    };

    if (id) {
      // Actualizar existente
      await db.update(products).set(values).where(eq(products.id, id));
    } else {
      // Crear nuevo
      await db.insert(products).values(values);
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error saving product:", error);
    return { error: "Error al guardar en la base de datos" };
  }
}

export async function deleteProduct(id: number) {
  try {
    await db.delete(products).where(eq(products.id, id));
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Error al eliminar el producto" };
  }
}

export async function updateProductStock(id: number, newStock: number) {
  try {
    await db.update(products).set({ stock: newStock }).where(eq(products.id, id));
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating stock:", error);
    return { error: "Error al actualizar el stock" };
  }
}
