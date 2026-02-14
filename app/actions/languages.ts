"use server";

import { desc, eq, and, or, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { languages, userLanguagePreferences } from "@/lib/db/schema";

export async function getLanguages(userId?: string) {
  if (userId) {
    return await db
      .select()
      .from(languages)
      .where(or(isNull(languages.userId), eq(languages.userId, userId)))
      .orderBy(desc(languages.createdAt));
  }

  // Admin view or fallback
  return await db.select().from(languages).orderBy(desc(languages.createdAt));
}

export async function getActiveLanguages(userId?: string) {
  if (userId) {
    return await db
      .select()
      .from(languages)
      .where(
        and(
          eq(languages.isActive, true),
          or(isNull(languages.userId), eq(languages.userId, userId))
        )
      )
      .orderBy(desc(languages.createdAt));
  }

  return await db
    .select()
    .from(languages)
    .where(and(eq(languages.isActive, true), isNull(languages.userId)))
    .orderBy(desc(languages.createdAt));
}

export async function addLanguage(data: {
  code: string;
  name: string;
  flag: string;
  region?: string;
  speakers?: string;
  userId?: string;
}) {
  try {
    // Sanitize userId
    const userIdToUse =
      data.userId && data.userId.trim() !== "" ? data.userId : undefined;

    const [newLang] = await db
      .insert(languages)
      .values({ ...data, userId: userIdToUse })
      .returning({ id: languages.id });

    // If a user created this language, auto-enable it for them
    if (userIdToUse && newLang) {
      await db.insert(userLanguagePreferences).values({
        userId: userIdToUse,
        languageId: newLang.id,
      });
    }

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

export async function deleteLanguage(id: string, userId?: string) {
  try {
    const existingLang = await db.query.languages.findFirst({
      where: eq(languages.id, id),
    });

    if (!existingLang) {
      return { success: false, error: "Language not found." };
    }

    // Permission check
    if (existingLang.userId && existingLang.userId !== userId) {
      return { success: false, error: "Unauthorized to delete this language." };
    }

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
