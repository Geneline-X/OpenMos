"use server";

import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { aiModels } from "@/lib/db/schema";

export async function getModels() {
  return await db.select().from(aiModels).orderBy(desc(aiModels.createdAt));
}

export async function getActiveModels() {
  return await db
    .select()
    .from(aiModels)
    .where(eq(aiModels.isActive, true))
    .orderBy(desc(aiModels.createdAt));
}

export async function addModel(data: {
  name: string;
  value: string;
  description?: string;
}) {
  try {
    await db.insert(aiModels).values(data);
    revalidatePath("/admin/settings");
    revalidatePath("/admin/upload");
    revalidatePath("/admin/studies");

    return { success: true };
  } catch (error) {
    console.error("Failed to add model:", error);

    return {
      success: false,
      error: "Failed to add model. Value must be unique.",
    };
  }
}

export async function toggleModel(id: string, isActive: boolean) {
  try {
    await db.update(aiModels).set({ isActive }).where(eq(aiModels.id, id));
    revalidatePath("/admin/settings");
    revalidatePath("/admin/upload");
    revalidatePath("/admin/studies");

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle model:", error);

    return { success: false, error: "Failed to update model status." };
  }
}

export async function deleteModel(id: string) {
  try {
    await db.delete(aiModels).where(eq(aiModels.id, id));
    revalidatePath("/admin/settings");
    revalidatePath("/admin/upload");
    revalidatePath("/admin/studies");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete model:", error);

    return { success: false, error: "Failed to delete model." };
  }
}
