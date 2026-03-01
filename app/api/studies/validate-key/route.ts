import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { db } from "@/lib/db";
import { studies, studyLanguages, languages } from "@/lib/db/schema";

/**
 * POST /api/studies/validate-key
 *
 * Validates a study access key and returns study info + available languages.
 * Used by the evaluator onboarding flow.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "Access key is required" },
        { status: 400 },
      );
    }

    // Normalize key (trim whitespace, uppercase)
    const normalizedKey = key.trim().toUpperCase();

    // Find the study by access key
    const study = await db.query.studies.findFirst({
      where: and(
        eq(studies.accessKey, normalizedKey),
        eq(studies.isActive, true),
      ),
    });

    if (!study) {
      return NextResponse.json(
        { error: "Invalid or inactive study key" },
        { status: 404 },
      );
    }

    // Fetch languages associated with this study
    const studyLangs = await db
      .select({
        id: languages.id,
        name: languages.name,
        code: languages.code,
        flag: languages.flag,
      })
      .from(studyLanguages)
      .innerJoin(languages, eq(studyLanguages.languageId, languages.id))
      .where(eq(studyLanguages.studyId, study.id));

    return NextResponse.json({
      studyId: study.id,
      studyName: study.name,
      samplesPerRater: study.samplesPerRater,
      languages: studyLangs,
    });
  } catch (error) {
    console.error("Key validation error:", error);

    return NextResponse.json(
      { error: "Failed to validate key" },
      { status: 500 },
    );
  }
}
