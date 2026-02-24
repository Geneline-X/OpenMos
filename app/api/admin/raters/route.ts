import { NextRequest, NextResponse } from "next/server";
import { eq, count, desc, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  raters,
  evaluationSessions,
  ratings,
  audioSamples,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get raters that have participated in a session containing audio samples uploaded by the current user
    const userAudioIds = db
      .select({ id: audioSamples.id })
      .from(audioSamples)
      .where(eq(audioSamples.uploadedBy, userId));

    const userRaterIds = db
      .select({ id: ratings.raterId })
      .from(ratings)
      .where(inArray(ratings.audioId, userAudioIds));

    // Get raters with their session info
    const ratersData = await db
      .select({
        id: raters.id,
        age: raters.age,
        gender: raters.gender,
        nativeLanguage: raters.nativeLanguage,
        createdAt: raters.createdAt,
        sessionId: evaluationSessions.id,
        totalSamples: evaluationSessions.totalSamples,
        completedCount: evaluationSessions.completedCount,
        startedAt: evaluationSessions.startedAt,
        completedAt: evaluationSessions.completedAt,
      })
      .from(raters)
      .leftJoin(evaluationSessions, eq(raters.id, evaluationSessions.raterId))
      .where(inArray(raters.id, userRaterIds))
      .orderBy(desc(raters.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(raters)
      .where(inArray(raters.id, userRaterIds));

    // Transform data
    const transformedRaters = ratersData.map((r) => {
      const startedAt = r.startedAt ? new Date(r.startedAt) : null;
      const completedAt = r.completedAt ? new Date(r.completedAt) : null;

      let avgTime = "N/A";

      if (startedAt && completedAt) {
        const diffMs = completedAt.getTime() - startedAt.getTime();
        const diffMins = Math.round(diffMs / 60000);

        avgTime = `${diffMins}m`;
      }

      return {
        id: r.id,
        language: r.nativeLanguage,
        age: r.age,
        gender: r.gender,
        completed: r.completedCount || 0,
        total: r.totalSamples || 20,
        avgTime,
        status: r.completedAt
          ? "completed"
          : r.sessionId
            ? "in_progress"
            : "not_started",
        createdAt: r.createdAt,
      };
    });

    return NextResponse.json({
      raters: transformedRaters,
      total: totalResult?.count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Raters fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch raters" },
      { status: 500 },
    );
  }
}
