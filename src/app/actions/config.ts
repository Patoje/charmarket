"use server";

import { db } from "@/lib/db";
import { globalConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getDolarValue(): Promise<number> {
  const config = await db.query.globalConfigs.findFirst({
    where: eq(globalConfigs.key, "dolar_charmarket"),
  });
  return config ? Number(config.value) : 1000;
}

export async function updateDolarValue(formData: FormData) {
  const value = formData.get("dolarValue")?.toString();

  if (!value || isNaN(Number(value)) || Number(value) <= 0) {
    return { error: "Valor de dólar inválido" };
  }

  try {
    await db.update(globalConfigs)
      .set({ value: value, updatedAt: new Date() })
      .where(eq(globalConfigs.key, "dolar_charmarket"));

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar el dólar:", error);
    return { error: "Hubo un error al actualizar en la base de datos" };
  }
}
