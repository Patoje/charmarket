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
    contains: products.contains,
    imageUrl: products.imageUrl,
    categoryId: products.categoryId,
    categoryName: categories.name,
    subCategory: products.subCategory,
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
    const contains = formData.get("contains") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const categoryId = parseInt(formData.get("categoryId") as string);
    const subCategory = formData.get("subCategory") as string;
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
      contains: contains || null,
      imageUrl: imageUrl || null,
      categoryId,
      subCategory: subCategory || null,
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

export async function importProductsFromCSV(parsedRows: string[][]) {
  try {


    // 1. Obtener todas las categorías existentes para hacer match
    const existingCats = await db.select().from(categories);
    const catMap = new Map(existingCats.map(c => [c.name.toLowerCase().trim(), c.id]));

    const valuesToInsert: any[] = [];

    // Helper para limpiar precios (ej. "$175,120" -> "175120", "$119.00" -> "119.00")
    const parsePrice = (val: string | undefined) => {
      if (!val) return 0;
      let cleaned = val.replace(/\$/g, "").replace(/\s/g, "");
      cleaned = cleaned.replace(/,/g, ""); 
      return parseFloat(cleaned) || 0;
    };

    const getOrCreateCategory = async (name: string) => {
      const nameUpper = name.toUpperCase().trim();
      
      // 1. Intentar encontrar coincidencia exacta o si el nombre del CSV incluye el nombre oficial
      for (const cat of existingCats) {
        const catUpper = cat.name.toUpperCase().trim();
        if (nameUpper === catUpper) return cat.id;
        if (nameUpper.includes(catUpper)) return cat.id;
      }
      
      // 2. Si no coincide con ninguna oficial, lo enviamos a "General" en lugar de crear basura
      const key = "general";
      if (catMap.has(key)) return catMap.get(key)!;
      
      // Solo creamos "General" si no existe
      const [newCat] = await db.insert(categories).values({ name: "General", slug: "general" }).returning({ id: categories.id });
      catMap.set(key, newCat.id);
      // Lo añadimos a existingCats por si acaso
      existingCats.push(newCat as any);
      return newCat.id;
    };

    // Estado del parser
    let pendingCategoryName: string | null = null;
    let currentCategoryName = "";
    let currentCategoryId: number | null = null;
    let currentSubCategory: string | null = null;
    let currentLanguage = "Español";
    let currentSubtitle: string | null = null;
    let columnIndexes: Record<string, number> = {};

    // 2. Iterar sobre las filas crudas del CSV
    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      if (!row || row.length === 0) continue;

      // Filtrar celdas vacías
      const nonEmptyCells = row.filter(cell => cell && cell.trim() !== "");
      if (nonEmptyCells.length === 0) continue;
      
      // A. Detectar categoría (título suelto)
      if (nonEmptyCells.length === 1 && row[0]?.trim() !== "") {
        pendingCategoryName = row[0].trim();
        currentSubtitle = null; // Reiniciar subtítulo al cambiar de categoría
        continue;
      }

      const rowUpper = row.map(cell => cell ? cell.trim().toUpperCase() : "");

      // B. Detectar fila de encabezados
      if (rowUpper.includes("PRODUCTO") || rowUpper.includes("MINORISTA USD")) {
        if (pendingCategoryName) {
          const rawPendingUpper = pendingCategoryName.toUpperCase();
          
          // Lógica de adivinación de categoría oficial y subcategoría
          if (rawPendingUpper.includes("ETB")) {
            currentCategoryName = "ETB";
            currentLanguage = "Inglés"; // El usuario pidió que ETB siempre sea Inglés
            currentSubCategory = rawPendingUpper.includes("MODERNO") || rawPendingUpper.includes("MODERNA") ? "Moderna" : rawPendingUpper.includes("VINTAGE") ? "Vintage" : null;
          } else if (rawPendingUpper.includes("BOOSTER BOX") && !rawPendingUpper.includes("JAPONES")) {
            currentCategoryName = "Booster Box";
            currentLanguage = "Inglés"; // Si no es japonés, lo ponemos en inglés por defecto para BB
            currentSubCategory = rawPendingUpper.includes("MODERNO") || rawPendingUpper.includes("MODERNA") ? "Moderna" : rawPendingUpper.includes("VINTAGE") ? "Vintage" : null;
          } else if (rawPendingUpper.includes("JAPONES COMUN") || rawPendingUpper.includes("JAPONÉS COMÚN")) {
            currentCategoryName = "Booster Box";
            currentLanguage = "Japonés";
            currentSubCategory = "Común";
          } else if (rawPendingUpper.includes("JAPONES ESPECIAL") || rawPendingUpper.includes("JAPONÉS ESPECIAL")) {
            // La categoría se decidirá producto a producto (si tiene Box es Collection Box)
            currentCategoryName = "Japonés Especial"; // Temporal
            currentLanguage = "Japonés";
            currentSubCategory = "Especial";
          } else if (rawPendingUpper.includes("COLLECTION BOX")) {
            currentCategoryName = "Collection Box";
            currentLanguage = "Inglés";
            currentSubCategory = null;
          } else if (rawPendingUpper.includes("ACCESORIOS")) {
            currentCategoryName = "Accesorios";
            currentLanguage = "Español";
            currentSubCategory = null;
          } else {
            // Fallback general
            currentCategoryName = pendingCategoryName;
            currentLanguage = "Español";
            currentSubCategory = null;
          }

          // Si NO es Japonés Especial (que se evalúa luego), buscamos su ID
          if (currentCategoryName !== "Japonés Especial") {
            currentCategoryId = await getOrCreateCategory(currentCategoryName);
          } else {
            currentCategoryId = null; // Se buscará por producto
          }
          
          pendingCategoryName = null;
          columnIndexes = {};
        }

        columnIndexes = {
          name: rowUpper.indexOf("PRODUCTO"),
          expansion: rowUpper.indexOf("EXPANSION EN INGLES"),
          minorista: rowUpper.indexOf("MINORISTA USD"),
          mayorista: rowUpper.indexOf("MAYORISTA USD"),
          stock: rowUpper.indexOf("STOCK")
        };
        
        if (columnIndexes.name === -1) {
          columnIndexes.name = rowUpper.findIndex(c => c.includes("PRODUCTO"));
        }
        
        continue;
      }

      // C. Es un producto
      if (columnIndexes.name !== undefined && columnIndexes.name !== -1 && row[columnIndexes.name] && row[columnIndexes.name].trim() !== "") {
        
        const minoristaStr = columnIndexes.minorista !== -1 ? row[columnIndexes.minorista] : "";
        const mayoristaStr = columnIndexes.mayorista !== -1 ? row[columnIndexes.mayorista] : "";
        
        // Si no tiene precios, asumimos que es un subtítulo (como "SLEEVES ETB")
        if (!minoristaStr && !mayoristaStr) {
          currentSubtitle = row[columnIndexes.name].trim();
          continue;
        }

        let rawName = row[columnIndexes.name].trim();
        
        // Formateo de nombre si tiene expansión
        if (columnIndexes.expansion !== undefined && columnIndexes.expansion !== -1 && row[columnIndexes.expansion]) {
          const expansion = row[columnIndexes.expansion].trim();
          if (expansion !== "") {
            rawName = `${rawName} (${expansion})`;
          }
        }

        // Si es Japonés Especial, determinamos la categoría según si dice "Box"
        let finalCategoryId = currentCategoryId;
        let finalCategoryName = currentCategoryName;
        let finalSubCategory = currentSubCategory;
        
        if (currentCategoryName === "Japonés Especial" || currentCategoryId === null) {
          if (rawName.toUpperCase().includes("BOX")) {
            finalCategoryName = "Collection Box";
            finalSubCategory = null; // Collection boxes no llevan subcategoría "Especial"
          } else {
            finalCategoryName = "Booster Box"; // Default para japos especiales que no son boxes
            finalSubCategory = "Especial";
          }
          finalCategoryId = await getOrCreateCategory(finalCategoryName);
        }

        if (!finalCategoryId) {
          finalCategoryId = await getOrCreateCategory("General");
        }

        // Si hay un subtítulo activo, lo añadimos al nombre para darle contexto
        const name = currentSubtitle ? `${rawName} (${currentSubtitle})` : rawName;
        const stockStr = columnIndexes.stock !== -1 ? row[columnIndexes.stock] : "";

        const minorista = parsePrice(minoristaStr);
        const mayorista = parsePrice(mayoristaStr);
        const stock = parseInt(stockStr) || 0;

        valuesToInsert.push({
          name,
          description: "",
          imageUrl: null,
          categoryId: finalCategoryId,
          subCategory: finalSubCategory,
          language: currentLanguage,
          priceUsdMinorista: minorista.toString(),
          priceUsdMayorista: mayorista.toString(),
          stock: stock,
          isActive: true,
        });
      }
    }

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
