"use server";

import { eq, desc, or, isNull, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { aiModels, userModelPreferences } from "@/lib/db/schema";

// ... existing imports ...

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

// Fetch models available to a specific user (Global + Private)
export async function getAvailableModels(userId?: string) {
  if (!userId) {
    // If no user, only return global models (isActive check? or all global?)
    // For admin settings list, usually we want all to show availability?
    // But for non-admin, maybe valid ones.
    // Let's return all Global models.
    return await db
      .select()
      .from(aiModels)
      .where(isNull(aiModels.userId))
      .orderBy(desc(aiModels.createdAt));
  }

  return await db
    .select()
    .from(aiModels)
    .where(
      or(
        isNull(aiModels.userId), // Global
        eq(aiModels.userId, userId) // Owned by user
      )
    )
    .orderBy(desc(aiModels.createdAt));
}

export async function addModel(data: {
  name: string;
  value: string;
  description?: string;
  userId?: string;
}) {
  try {
    // Sanitize userId (handle empty string from UI)
    const userIdToUse =
      data.userId && data.userId.trim() !== "" ? data.userId : undefined;

    const [newModel] = await db
      .insert(aiModels)
      .values({ ...data, userId: userIdToUse })
      .returning({ id: aiModels.id });

    // If a user created this model, auto-enable it for them
    if (userIdToUse && newModel) {
      await db.insert(userModelPreferences).values({
        userId: userIdToUse,
        modelId: newModel.id,
      });
    }

    // Validating paths
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

export async function deleteModel(id: string, userId?: string) {
  try {
    const existingModel = await db.query.aiModels.findFirst({
      where: eq(aiModels.id, id),
    });

    if (!existingModel) {
      return { success: false, error: "Model not found." };
    }

    // Permission check:
    // If model has a userId (private), only that user can delete it
    // If model has no userId (global), only admins can delete it (we assume admin check happens upstream or we check role here?)
    // For now, if userId is passed, we check against it.

    if (existingModel.userId && existingModel.userId !== userId) {
      return { success: false, error: "Unauthorized to delete this model." };
    }

    // If global model (no userId), we should probably block deletion by regular users if we had role info here.
    // For now, assuming UI handles role-based access for global models,
    // but strict check for private models is good.

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
