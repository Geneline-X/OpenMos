"use server";

import { eq, desc, or, isNull, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiModels, userModelPreferences } from "@/lib/db/schema";

// ... existing imports ...

export async function getModels() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return [];

  return await db
    .select()
    .from(aiModels)
    .where(or(isNull(aiModels.userId), eq(aiModels.userId, userId)))
    .orderBy(desc(aiModels.createdAt));
}

export async function getActiveModels() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return [];

  return await db
    .select()
    .from(aiModels)
    .where(
      and(
        eq(aiModels.isActive, true),
        or(isNull(aiModels.userId), eq(aiModels.userId, userId)),
      ),
    )
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
        eq(aiModels.userId, userId), // Owned by user
      ),
    )
    .orderBy(desc(aiModels.createdAt));
}

export async function addModel(data: {
  name: string;
  value: string;
  description?: string;
}) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) throw new Error("Unauthorized");

    const [newModel] = await db
      .insert(aiModels)
      .values({ ...data, userId: currentUserId })
      .returning({ id: aiModels.id });

    // If a user created this model, auto-enable it for them
    if (newModel) {
      await db.insert(userModelPreferences).values({
        userId: currentUserId,
        modelId: newModel.id,
      });
    }

    // Validating paths
    revalidatePath("/admin/settings");
    revalidatePath("/admin/upload");
    revalidatePath("/admin/studies");

    return { success: true, modelId: newModel.id };
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
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) throw new Error("Unauthorized");

    // Make sure the model belongs to the user or is global
    await db
      .update(aiModels)
      .set({ isActive })
      .where(
        and(
          eq(aiModels.id, id),
          or(isNull(aiModels.userId), eq(aiModels.userId, userId)),
        ),
      );
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
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) throw new Error("Unauthorized");

    const existingModel = await db.query.aiModels.findFirst({
      where: eq(aiModels.id, id),
    });

    if (!existingModel) {
      return { success: false, error: "Model not found." };
    }

    // Permission check:
    if (existingModel.userId) {
      if (existingModel.userId !== currentUserId) {
        return { success: false, error: "Unauthorized to delete this model." };
      }
    } else {
      // If global model (no userId), only owners can delete it
      if (session.user.role !== "owner") {
        return {
          success: false,
          error: "Only owners can delete global models.",
        };
      }
    }

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
