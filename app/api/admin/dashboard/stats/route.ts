import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ratings, raters, evaluationSessions, audioSamples } from "@/lib/db/schema";
import { eq, sql, count, avg, and, gte, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total ratings
    const [totalRatingsResult] = await db
      .select({ count: count() })
      .from(ratings);

    // Get ratings from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todayRatingsResult] = await db
      .select({ count: count() })
      .from(ratings)
      .where(gte(ratings.timestamp, today));

    // Get active sessions (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const [activeSessionsResult] = await db
      .select({ count: count() })
      .from(evaluationSessions)
      .where(
        and(
          gte(evaluationSessions.startedAt, thirtyMinutesAgo),
          sql`${evaluationSessions.completedAt} IS NULL`
        )
      );

    // Get completion rate
    const [completedSessionsResult] = await db
      .select({ count: count() })
      .from(evaluationSessions)
      .where(sql`${evaluationSessions.completedAt} IS NOT NULL`);

    const [totalSessionsResult] = await db
      .select({ count: count() })
      .from(evaluationSessions);

    const completionRate = totalSessionsResult.count > 0
      ? Math.round((completedSessionsResult.count / totalSessionsResult.count) * 100)
      : 0;

    // Get MOS by model
    const modelStats = await db
      .select({
        modelType: audioSamples.modelType,
        avgScore: avg(ratings.score),
        count: count(),
      })
      .from(ratings)
      .innerJoin(audioSamples, eq(ratings.audioId, audioSamples.id))
      .groupBy(audioSamples.modelType);

    // Get unique raters count
    const [uniqueRatersResult] = await db
      .select({ count: sql`COUNT(DISTINCT ${ratings.raterId})` })
      .from(ratings);

    // Recent activity
    const recentRatings = await db
      .select({
        id: ratings.id,
        score: ratings.score,
        timestamp: ratings.timestamp,
        modelType: audioSamples.modelType,
        language: audioSamples.language,
      })
      .from(ratings)
      .innerJoin(audioSamples, eq(ratings.audioId, audioSamples.id))
      .orderBy(desc(ratings.timestamp))
      .limit(10);

    return NextResponse.json({
      totalRatings: totalRatingsResult.count,
      ratingsToday: todayRatingsResult.count,
      activeSessions: activeSessionsResult.count,
      completionRate,
      totalSessions: totalSessionsResult.count,
      completedSessions: completedSessionsResult.count,
      uniqueRaters: Number(uniqueRatersResult.count) || 0,
      modelStats: modelStats.map((m) => ({
        model: m.modelType,
        avgScore: parseFloat(Number(m.avgScore || 0).toFixed(2)),
        count: m.count,
      })),
      recentActivity: recentRatings.map((r) => ({
        id: r.id,
        score: r.score,
        timestamp: r.timestamp,
        modelType: r.modelType,
        language: r.language,
      })),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
