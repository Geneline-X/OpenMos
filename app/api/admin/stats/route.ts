import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audioSamples, ratings, raters, evaluationSessions } from "@/lib/db/schema";
import { sql, eq, count, avg, desc, and, gte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get total ratings count
    const [totalRatingsResult] = await db
      .select({ count: count() })
      .from(ratings);
    const totalRatings = totalRatingsResult?.count || 0;

    // Get today's ratings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todayRatingsResult] = await db
      .select({ count: count() })
      .from(ratings)
      .where(gte(ratings.timestamp, today));
    const ratingsToday = todayRatingsResult?.count || 0;

    // Get last week's ratings for trend
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const [lastWeekResult] = await db
      .select({ count: count() })
      .from(ratings)
      .where(gte(ratings.timestamp, lastWeek));
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const [prevWeekResult] = await db
      .select({ count: count() })
      .from(ratings)
      .where(
        and(
          gte(ratings.timestamp, twoWeeksAgo),
          sql`${ratings.timestamp} < ${lastWeek}`
        )
      );
    
    const thisWeek = lastWeekResult?.count || 0;
    const prevWeek = prevWeekResult?.count || 1;
    const ratingsTrend = Math.round(((thisWeek - prevWeek) / prevWeek) * 100);

    // Get active sessions (sessions started in last hour without completion)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    const [activeSessionsResult] = await db
      .select({ count: count() })
      .from(evaluationSessions)
      .where(
        and(
          gte(evaluationSessions.startedAt, oneHourAgo),
          sql`${evaluationSessions.completedAt} IS NULL`
        )
      );
    const activeSessions = activeSessionsResult?.count || 0;

    // Get completion rate
    const [totalSessionsResult] = await db
      .select({ count: count() })
      .from(evaluationSessions);
    const [completedSessionsResult] = await db
      .select({ count: count() })
      .from(evaluationSessions)
      .where(sql`${evaluationSessions.completedAt} IS NOT NULL`);
    
    const totalSessions = totalSessionsResult?.count || 1;
    const completedSessions = completedSessionsResult?.count || 0;
    const completionRate = Math.round((completedSessions / totalSessions) * 100);

    // Get total raters
    const [totalRatersResult] = await db
      .select({ count: count() })
      .from(raters);
    const totalRaters = totalRatersResult?.count || 0;

    // Get total samples
    const [totalSamplesResult] = await db
      .select({ count: count() })
      .from(audioSamples)
      .where(eq(audioSamples.isActive, true));
    const totalSamples = totalSamplesResult?.count || 0;

    // Get average MOS score
    const [avgMosResult] = await db
      .select({ avg: avg(ratings.score) })
      .from(ratings);
    const avgMos = parseFloat(avgMosResult?.avg || "0").toFixed(2);

    // Get average time to rate
    const [avgTimeResult] = await db
      .select({ avg: avg(ratings.timeToRateMs) })
      .from(ratings);
    const avgTimeMs = avgTimeResult?.avg || 0;
    const avgTimeSeconds = Math.round(Number(avgTimeMs) / 1000);

    return NextResponse.json({
      totalRatings,
      ratingsToday,
      ratingsTrend,
      activeSessions,
      avgSessionDuration: "N/A",
      completionRate,
      completionTrend: 0,
      avgDuration: `${avgTimeSeconds}s`,
      durationDiff: "",
      totalRaters,
      totalSamples,
      avgMos,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
