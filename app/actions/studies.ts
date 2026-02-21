"use server";

import { desc, eq, inArray, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  studies,
  studyModels,
  studyLanguages,
  aiModels,
  languages,
} from "@/lib/db/schema";

export type StudyWithRelations = typeof studies.$inferSelect & {
  models: string[];
  languages: string[];
};

export async function getStudies() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return [];

  const allStudies = await db
    .select()
    .from(studies)
    .where(eq(studies.userId, userId))
    .orderBy(desc(studies.createdAt));

  // Enrich with relations
  const studiesWithRelations = await Promise.all(
    allStudies.map(async (study) => {
      const models = await db
        .select({ value: aiModels.value })
        .from(studyModels)
        .innerJoin(aiModels, eq(studyModels.modelId, aiModels.id))
        .where(eq(studyModels.studyId, study.id));

      const langs = await db
        .select({ code: languages.code })
        .from(studyLanguages)
        .innerJoin(languages, eq(studyLanguages.languageId, languages.id))
        .where(eq(studyLanguages.studyId, study.id));

      return {
        ...study,
        models: models.map((m) => m.value),
        languages: langs.map((l) => l.code),
      };
    }),
  );

  return studiesWithRelations;
}

export async function getActiveStudy() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const activeStudy = await db.query.studies.findFirst({
    where: and(eq(studies.isActive, true), eq(studies.userId, userId)),
  });

  if (!activeStudy) return null;

  // Fetch relations for the active study
  const models = await db
    .select({ value: aiModels.value })
    .from(studyModels)
    .innerJoin(aiModels, eq(studyModels.modelId, aiModels.id))
    .where(eq(studyModels.studyId, activeStudy.id));

  const langs = await db
    .select({ code: languages.code })
    .from(studyLanguages)
    .innerJoin(languages, eq(studyLanguages.languageId, languages.id))
    .where(eq(studyLanguages.studyId, activeStudy.id));

  return {
    ...activeStudy,
    models: models.map((m) => m.value),
    languages: langs.map((l) => l.code),
  };
}

export async function createStudy(data: {
  name: string;
  samplesPerRater: number;
  modelValues: string[];
  languageCodes: string[];
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) throw new Error("Unauthorized");

    // 1. Create Study
    const [newStudy] = await db
      .insert(studies)
      .values({
        name: data.name,
        samplesPerRater: data.samplesPerRater,
        isActive: false, // Default to inactive
        userId,
      })
      .returning();

    // 2. Link Models
    if (data.modelValues.length > 0) {
      const selectedModels = await db
        .select({ id: aiModels.id })
        .from(aiModels)
        .where(inArray(aiModels.value, data.modelValues));

      if (selectedModels.length > 0) {
        await db.insert(studyModels).values(
          selectedModels.map((m) => ({
            studyId: newStudy.id,
            modelId: m.id,
          })),
        );
      }
    }

    // 3. Link Languages
    if (data.languageCodes.length > 0) {
      const selectedLanguages = await db
        .select({ id: languages.id })
        .from(languages)
        .where(inArray(languages.code, data.languageCodes));

      if (selectedLanguages.length > 0) {
        await db.insert(studyLanguages).values(
          selectedLanguages.map((l) => ({
            studyId: newStudy.id,
            languageId: l.id,
          })),
        );
      }
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin/studies"); // Ensure studies page updates

    return { success: true, study: newStudy };
  } catch (error) {
    console.error("Failed to create study:", error);

    // TODO: Manually rollback created study if relations fail (complex without transactions)
    return { success: false, error: "Failed to create study" };
  }
}

export async function deleteStudy(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) throw new Error("Unauthorized");

    await db
      .delete(studies)
      .where(and(eq(studies.id, id), eq(studies.userId, userId)));
    revalidatePath("/admin/settings");
    revalidatePath("/admin/studies");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete study:", error);

    return { success: false, error: "Failed to delete study" };
  }
}

export async function toggleStudyActive(id: string, isActive: boolean) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) throw new Error("Unauthorized");

    if (isActive) {
      // Deactivate all other studies if we are activating one
      await db
        .update(studies)
        .set({ isActive: false })
        .where(and(eq(studies.isActive, true), eq(studies.userId, userId)));
    }

    await db
      .update(studies)
      .set({ isActive })
      .where(and(eq(studies.id, id), eq(studies.userId, userId)));

    revalidatePath("/admin/settings");
    revalidatePath("/admin/studies");

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle study:", error);

    return { success: false, error: "Failed to update study status" };
  }
}
