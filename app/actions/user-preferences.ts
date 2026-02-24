"use server";

import { eq, and, or, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  userModelPreferences,
  userLanguagePreferences,
  aiModels,
  languages,
} from "@/lib/db/schema";

/**
 * Get user's enabled models
 */
export async function getUserModels(userId: string) {
  // Get models that are either:
  // 1. Global (isActive=true) AND enabled by user in userModelPreferences
  // 2. Private (owned by userId) - these are always enabled for the owner (or we can track preference too, but for now let's say they are enabled by existence or need preference record?)
  // Actually, simpler:
  // We want to return a list of models available to this user.
  // The UI uses this list as "enabled models".
  // So we should return:
  // - Global models that are in userModelPreferences
  // - Private models that are owned by user (implied enabled? or also in userModelPreferences?)
  //
  // Recommendation: Auto-add private models to userModelPreferences upon creation.
  // Then this query doesn't change structure much, but we need to ensure we join correctly.

  // Wait, if we use the same query:
  // .innerJoin(aiModels, eq(userModelPreferences.modelId, aiModels.id))
  // .where(and(eq(userModelPreferences.userId, userId), ...))
  //
  // We just need to make sure private models are also active?
  // aiModels.isActive is true by default.
  // But we need to make sure we don't accidentally show *other users'* private models if they were somehow in prefs (shouldn't happen).
  // The join on modelId is safe.
  // The concern is: does `aiModels.isActive` apply to private models? Yes, user can toggle their own model.
  //
  // However, `getUserModels` currently filters by `aiModels.isActive, true`.
  // If a global model is disabled by admin, it disappears from everyone's list.
  // If a private model is disabled by owner, it disappears from their list.
  // This seems correct.
  //
  // BUT: we need to make sure the user sees *their* private models.
  // The current query joins userModelPreferences.
  // So if we ensure that when a private model is created, a preference is added, then the existing query works!
  //
  // Let's modify `addModel` to add the preference!
  // Ah, I missed that in `addModel` update. I should go back and fix `addModel`.
  //
  // But wait, `getUserModels` might also want to return *private* models specifically to distinguish them in UI?
  // The UI currently just takes `activeModels`.
  // We might want to add a field `isPrivate` or `ownedBy` to the returned object.

  return await db
    .select({
      id: aiModels.id,
      name: aiModels.name,
      value: aiModels.value,
      description: aiModels.description,
      isActive: aiModels.isActive,
      createdAt: aiModels.createdAt,
      userId: aiModels.userId, // Return ownership info
    })
    .from(userModelPreferences)
    .innerJoin(aiModels, eq(userModelPreferences.modelId, aiModels.id))
    .where(
      and(
        eq(userModelPreferences.userId, userId),
        eq(aiModels.isActive, true),
        or(isNull(aiModels.userId), eq(aiModels.userId, userId))
      )
    );
}

/**
 * Get user's enabled languages
 */
export async function getUserLanguages(userId: string) {
  return await db
    .select({
      id: languages.id,
      code: languages.code,
      name: languages.name,
      flag: languages.flag,
      region: languages.region,
      speakers: languages.speakers,
      isActive: languages.isActive,
      createdAt: languages.createdAt,
      userId: languages.userId,
    })
    .from(userLanguagePreferences)
    .innerJoin(languages, eq(userLanguagePreferences.languageId, languages.id))
    .where(
      and(
        eq(userLanguagePreferences.userId, userId),
        eq(languages.isActive, true), // Only show if language is still active globally
        or(isNull(languages.userId), eq(languages.userId, userId))
      )
    );
}

/**
 * Check if user has a specific model enabled
 */
export async function isUserModelEnabled(userId: string, modelId: string) {
  const result = await db
    .select()
    .from(userModelPreferences)
    .where(
      and(
        eq(userModelPreferences.userId, userId),
        eq(userModelPreferences.modelId, modelId)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Check if user has a specific language enabled
 */
export async function isUserLanguageEnabled(
  userId: string,
  languageId: string
) {
  const result = await db
    .select()
    .from(userLanguagePreferences)
    .where(
      and(
        eq(userLanguagePreferences.userId, userId),
        eq(userLanguagePreferences.languageId, languageId)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Toggle model for user (enable if disabled, disable if enabled)
 */
export async function toggleUserModel(userId: string, modelId: string) {
  try {
    // Verify model exists and is available to user
    const model = await db.query.aiModels.findFirst({
      where: eq(aiModels.id, modelId),
    });

    if (!model) {
      throw new Error("Model not found");
    }

    if (model.userId && model.userId !== userId) {
      throw new Error("Unauthorized to access this model");
    }

    const existing = await db
      .select()
      .from(userModelPreferences)
      .where(
        and(
          eq(userModelPreferences.userId, userId),
          eq(userModelPreferences.modelId, modelId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Disable: remove from preferences
      await db
        .delete(userModelPreferences)
        .where(eq(userModelPreferences.id, existing[0].id));

      return { success: true, enabled: false };
    } else {
      // Enable: add to preferences
      await db.insert(userModelPreferences).values({ userId, modelId });

      return { success: true, enabled: true };
    }
  } catch (error) {
    console.error("Error toggling user model:", error);
    throw new Error("Failed to toggle model");
  }
}

/**
 * Toggle language for user (enable if disabled, disable if enabled)
 */
export async function toggleUserLanguage(userId: string, languageId: string) {
  try {
    // Verify language exists and is available to user
    const language = await db.query.languages.findFirst({
      where: eq(languages.id, languageId),
    });

    if (!language) {
      throw new Error("Language not found");
    }

    if (language.userId && language.userId !== userId) {
      throw new Error("Unauthorized to access this language");
    }

    const existing = await db
      .select()
      .from(userLanguagePreferences)
      .where(
        and(
          eq(userLanguagePreferences.userId, userId),
          eq(userLanguagePreferences.languageId, languageId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Disable: remove from preferences
      await db
        .delete(userLanguagePreferences)
        .where(eq(userLanguagePreferences.id, existing[0].id));

      return { success: true, enabled: false };
    } else {
      // Enable: add to preferences
      await db.insert(userLanguagePreferences).values({ userId, languageId });

      return { success: true, enabled: true };
    }
  } catch (error) {
    console.error("Error toggling user language:", error);
    throw new Error("Failed to toggle language");
  }
}

/**
 * Initialize preferences for new user (enable all active models/languages)
 */
export async function initializeUserPreferences(userId: string) {
  try {
    // Get all active GLOBAL models
    const activeModels = await db
      .select({ id: aiModels.id })
      .from(aiModels)
      .where(and(eq(aiModels.isActive, true), isNull(aiModels.userId)));

    // Get all active GLOBAL languages
    const activeLanguages = await db
      .select({ id: languages.id })
      .from(languages)
      .where(and(eq(languages.isActive, true), isNull(languages.userId)));

    // Enable all models for user
    if (activeModels.length > 0) {
      await db.insert(userModelPreferences).values(
        activeModels.map((model) => ({
          userId,
          modelId: model.id,
        }))
      );
    }

    // Enable all languages for user
    if (activeLanguages.length > 0) {
      await db.insert(userLanguagePreferences).values(
        activeLanguages.map((lang) => ({
          userId,
          languageId: lang.id,
        }))
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error initializing user preferences:", error);
    throw new Error("Failed to initialize preferences");
  }
}
