"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { languages } from "@/lib/db/schema";

export async function getLanguages() {
  return await db.select().from(languages).orderBy(desc(languages.createdAt));
}

export async function getActiveLanguages() {
  return await db
    .select()
    .from(languages)
    .where(eq(languages.isActive, true))
    .orderBy(desc(languages.createdAt));
}

export async function addLanguage(data: {
  code: string;
  name: string;
  flag: string;
  region?: string;
  speakers?: string;
}) {
  try {
    await db.insert(languages).values(data);
    revalidatePath("/admin/settings");
    revalidatePath("/admin/upload");
    revalidatePath("/admin/studies");

    return { success: true };
  } catch (error) {
    console.error("Failed to add language:", error);

    return {
      success: false,
      error: "Failed to add language. Code must be unique.",
    };
  }
}

export async function toggleLanguage(id: string, isActive: boolean) {
  try {
    await db.update(languages).set({ isActive }).where(eq(languages.id, id));
    revalidatePath("/admin/settings");
    revalidatePath("/admin/upload");
    revalidatePath("/admin/studies");

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle language:", error);

    return { success: false, error: "Failed to update language status." };
  }
}

export async function deleteLanguage(id: string) {
  try {
    await db.delete(languages).where(eq(languages.id, id));
    revalidatePath("/admin/settings");
    revalidatePath("/admin/upload");
    revalidatePath("/admin/studies");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete language:", error);

    return { success: false, error: "Failed to delete language." };
  }
}
