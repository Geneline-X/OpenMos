"use server";

import { desc, eq, and, or, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { languages, userLanguagePreferences } from "@/lib/db/schema";

export async function getLanguages(userId?: string) {
  const session = await auth();
  const effectiveUserId = userId || session?.user?.id;

  if (effectiveUserId) {
    return await db
      .select()
      .from(languages)
      .where(
        or(isNull(languages.userId), eq(languages.userId, effectiveUserId)),
      )
      .orderBy(desc(languages.createdAt));
  }

  // Admin view or fallback - only globals if no user
  return await db
    .select()
    .from(languages)
    .where(isNull(languages.userId))
    .orderBy(desc(languages.createdAt));
}

export async function getActiveLanguages(userId?: string) {
  const session = await auth();
  const effectiveUserId = userId || session?.user?.id;

  if (effectiveUserId) {
    return await db
      .select()
      .from(languages)
      .where(
        and(
          eq(languages.isActive, true),
          or(isNull(languages.userId), eq(languages.userId, effectiveUserId)),
        ),
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
  name: string;
  flag: string;
  region?: string;
  speakers?: string;
}) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) throw new Error("Unauthorized");

    const code = data.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

    const [newLang] = await db
      .insert(languages)
      .values({ ...data, code, userId: currentUserId })
      .returning({ id: languages.id });

    // If a user created this language, auto-enable it for them
    if (newLang) {
      await db.insert(userLanguagePreferences).values({
        userId: currentUserId,
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
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) throw new Error("Unauthorized");

    // Make sure the language belongs to the user or is global
    await db
      .update(languages)
      .set({ isActive })
      .where(
        and(
          eq(languages.id, id),
          or(isNull(languages.userId), eq(languages.userId, userId)),
        ),
      );
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
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) throw new Error("Unauthorized");

    const existingLang = await db.query.languages.findFirst({
      where: eq(languages.id, id),
    });

    if (!existingLang) {
      return { success: false, error: "Language not found." };
    }

    // Permission check
    if (existingLang.userId) {
      if (existingLang.userId !== currentUserId) {
        return {
          success: false,
          error: "Unauthorized to delete this language.",
        };
      }
    } else {
      // It's a global language. Only 'owner' can delete.
      if (session.user.role !== "owner") {
        return {
          success: false,
          error: "Only owners can delete global languages.",
        };
      }
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
