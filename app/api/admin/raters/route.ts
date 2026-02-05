import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { raters, evaluationSessions, ratings } from "@/lib/db/schema";
import { eq, count, avg, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

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
      .orderBy(desc(raters.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(raters);

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
        status: r.completedAt ? "completed" : (r.sessionId ? "in_progress" : "not_started"),
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
      { status: 500 }
    );
  }
}
