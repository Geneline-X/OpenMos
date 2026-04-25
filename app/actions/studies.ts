"use server";

import {
  desc,
  eq,
  inArray,
  and,
  count,
  avg,
  countDistinct,
  sql,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  studies,
  studyModels,
  studyLanguages,
  aiModels,
  languages,
  evaluationSessions,
  ratings,
  audioSamples,
} from "@/lib/db/schema";

const utapi = new UTApi();

/**
 * Generate a unique, URL-safe access key for a study.
 * Format: MOS-XXXXXX (6 alphanumeric uppercase characters)
 */
function generateAccessKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No 0/O/1/I to avoid confusion
  let key = "MOS-";

  for (let i = 0; i < 6; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return key;
}

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

export interface StudyStats {
  totalRaters: number;
  completedRaters: number;
  totalRatings: number;
  avgMos: string;
  completionRate: number;
  modelPerformance: { model: string; avgScore: string; count: number }[];
}

export async function getStudyStats(studyId: string): Promise<StudyStats> {
  // Get session IDs for this study
  const studySessionIds = db
    .select({ id: evaluationSessions.id })
    .from(evaluationSessions)
    .where(eq(evaluationSessions.studyId, studyId));

  // Count raters who actually submitted ratings (not just started a session)
  const [raterCount] = await db
    .select({ total: countDistinct(ratings.raterId) })
    .from(ratings)
    .where(inArray(ratings.sessionId, studySessionIds));

  // Count raters who completed their session (completedAt is set)
  const [completedCount] = await db
    .select({ total: countDistinct(evaluationSessions.raterId) })
    .from(evaluationSessions)
    .innerJoin(ratings, eq(ratings.sessionId, evaluationSessions.id))
    .where(
      and(
        eq(evaluationSessions.studyId, studyId),
        sql`${evaluationSessions.completedAt} IS NOT NULL`,
      ),
    );

  // Get rating stats for this study (ratings linked via sessions)

  const [ratingStats] = await db
    .select({
      total: count(),
      avgScore: avg(ratings.score),
    })
    .from(ratings)
    .where(inArray(ratings.sessionId, studySessionIds));

  // Per-model performance
  const modelPerf = await db
    .select({
      model: audioSamples.modelType,
      avgScore: avg(ratings.score),
      count: count(),
    })
    .from(ratings)
    .innerJoin(audioSamples, eq(ratings.audioId, audioSamples.id))
    .where(inArray(ratings.sessionId, studySessionIds))
    .groupBy(audioSamples.modelType);

  const totalRaters = raterCount?.total || 0;
  const completedRaters = completedCount?.total || 0;
  const totalRatings = ratingStats?.total || 0;
  const avgMos = ratingStats?.avgScore
    ? parseFloat(ratingStats.avgScore as string).toFixed(2)
    : "--";

  return {
    totalRaters,
    completedRaters,
    totalRatings,
    avgMos,
    completionRate:
      totalRaters > 0 ? Math.round((completedRaters / totalRaters) * 100) : 0,
    modelPerformance: modelPerf.map((m) => ({
      model: m.model || "Unknown",
      avgScore: m.avgScore
        ? parseFloat(m.avgScore as string).toFixed(2)
        : "0.00",
      count: m.count,
    })),
  };
}

export async function createStudy(data: {
  name: string;
  modelValues: string[];
  languageCodes: string[];
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) throw new Error("Unauthorized");

    if (data.modelValues.length === 0) {
      return { success: false, error: "At least one model is required" };
    }

    if (data.languageCodes.length === 0) {
      return { success: false, error: "At least one language is required" };
    }

    // 1. Create Study with unique access key
    let accessKey = generateAccessKey();
    let keyExists = true;

    // Ensure key uniqueness (unlikely collision but be safe)
    while (keyExists) {
      const existing = await db.query.studies.findFirst({
        where: eq(studies.accessKey, accessKey),
      });

      if (!existing) {
        keyExists = false;
      } else {
        accessKey = generateAccessKey();
      }
    }

    const [newStudy] = await db
      .insert(studies)
      .values({
        name: data.name,
        accessKey,
        isActive: false,
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

    // Verify ownership before touching anything
    const study = await db.query.studies.findFirst({
      where: and(eq(studies.id, id), eq(studies.userId, userId)),
    });

    if (!study) return { success: false, error: "Study not found" };

    // 1. Collect UploadThing keys for all samples tied to this study
    //    so we can clean up CDN storage before the DB rows are gone.
    const samples = await db
      .select({ key: audioSamples.uploadthingKey })
      .from(audioSamples)
      .where(eq(audioSamples.studyId, id));

    const utKeys = samples
      .map((s) => s.key)
      .filter((k): k is string => Boolean(k));

    // 2. Delete CDN files (non-blocking — don't fail the whole operation if
    //    UploadThing is temporarily unreachable)
    if (utKeys.length > 0) {
      await utapi.deleteFiles(utKeys).catch((err) => {
        console.error("UploadThing cleanup failed during study deletion:", err);
      });
    }

    // 3. Delete the study row. The DB cascade takes care of:
    //    studies → audioSamples (studyId CASCADE)
    //    audioSamples → ratings   (audioId CASCADE)
    //    studies → studyModels    (studyId CASCADE, already wired)
    //    studies → studyLanguages (studyId CASCADE, already wired)
    //    evaluationSessions.studyId is SET NULL (historical sessions preserved)
    await db
      .delete(studies)
      .where(and(eq(studies.id, id), eq(studies.userId, userId)));

    revalidatePath("/admin/settings");
    revalidatePath("/admin/studies");

    return { success: true, deletedSamples: samples.length };
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
