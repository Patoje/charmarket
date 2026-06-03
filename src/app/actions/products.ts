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

export async function importProductsFromCSV(parsedRows: any[]) {
  try {
    // 1. Obtener la primera categoría disponible por defecto
    const allCats = await db.select().from(categories).limit(1);
    if (allCats.length === 0) {
      return { error: "No hay categorías creadas en la base de datos. Crea una categoría primero." };
    }
    const defaultCategoryId = allCats[0].id;

    // 2. Mapear las filas a objetos de inserción
    const valuesToInsert = parsedRows.map((row) => {
      // Parsear precios y stock. Si vienen vacíos o inválidos, se ponen en 0
      const minorista = parseFloat(row["minorista USD"]) || 0;
      const mayorista = parseFloat(row["Mayorista USD"]) || 0;
      const stock = parseInt(row["Stock"]) || 0;

      return {
        name: String(row["Nombre producto"] || "Producto sin nombre"),
        description: "",
        imageUrl: null, // Dejamos la imagen vacía para que la agreguen luego
        categoryId: defaultCategoryId,
        language: "Español", // Default, ya que el CSV no lo tiene
        priceUsdMinorista: minorista.toString(),
        priceUsdMayorista: mayorista.toString(),
        stock: stock,
        isActive: true,
      };
    });

    // 3. Insertar todo de forma masiva (Bulk Insert)
    if (valuesToInsert.length > 0) {
      await db.insert(products).values(valuesToInsert);
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    
    return { success: true, count: valuesToInsert.length };
  } catch (error) {
    console.error("Error importando CSV:", error);
    return { error: "Hubo un error al importar los datos a la base de datos." };
  }
}
