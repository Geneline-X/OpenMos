"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import {
  adminUsers,
  raters,
  sessions,
  evaluationSessions,
  ratings,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth"; // Assuming auth is set up

export async function updateAdminPreferences(preferences: Record<string, any>) {
  const session = await auth();

  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .update(adminUsers)
      .set({ preferences })
      .where(eq(adminUsers.email, session.user.email));

    revalidatePath("/admin/settings");

    return { success: true };
  } catch (error) {
    console.error("Failed to update preferences:", error);

    return { success: false, error: "Failed to update preferences" };
  }
}

export async function clearTestData() {
  const session = await auth();

  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  // TODO: Add stricter check for 'owner' role if needed

  try {
    // Delete in order of dependencies (child tables first)
    await db.delete(ratings);
    await db.delete(evaluationSessions);
    await db.delete(sessions);
    await db.delete(raters);

    // Note: We might want to keep audioSamples or delete them too depending on requirement
    // For now, keeping audio samples as they might be part of the 'study' definition,
    // but clearing the user-generated data.

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/settings");

    return { success: true };
  } catch (error) {
    console.error("Failed to clear test data:", error);

    return { success: false, error: "Failed to clear data" };
  }
}

export async function exportAllData() {
  const session = await auth();

  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const allRatings = await db.select().from(ratings);
    const allSessions = await db.select().from(evaluationSessions);
    const allRaters = await db.select().from(raters);

    return {
      success: true,
      data: {
        ratings: allRatings,
        sessions: allSessions,
        raters: allRaters,
      },
    };
  } catch (error) {
    console.error("Failed to export data:", error);

    return { success: false, error: "Failed to export data" };
  }
}
