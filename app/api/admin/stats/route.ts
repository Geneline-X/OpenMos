import { NextRequest, NextResponse } from "next/server";
import { sql, eq, count, avg, and, gte, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  audioSamples,
  ratings,
  raters,
  evaluationSessions,
  languages,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Subrequest to get current user's audio samples
    const userAudioIds = db
      .select({ id: audioSamples.id })
      .from(audioSamples)
      .where(eq(audioSamples.uploadedBy, userId));

    // Get total ratings count
    const [totalRatingsResult] = await db
      .select({ count: count() })
      .from(ratings)
      .where(inArray(ratings.audioId, userAudioIds));
    const totalRatings = totalRatingsResult?.count || 0;

    // Get today's ratings
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    const [todayRatingsResult] = await db
      .select({ count: count() })
      .from(ratings)
      .where(
        and(
          gte(ratings.timestamp, today),
          inArray(ratings.audioId, userAudioIds),
        ),
      );
    const ratingsToday = todayRatingsResult?.count || 0;

    // Get last week's ratings for trend
    const lastWeek = new Date();

    lastWeek.setDate(lastWeek.getDate() - 7);
    const [lastWeekResult] = await db
      .select({ count: count() })
      .from(ratings)
      .where(
        and(
          gte(ratings.timestamp, lastWeek),
          inArray(ratings.audioId, userAudioIds),
        ),
      );

    const twoWeeksAgo = new Date();

    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const [prevWeekResult] = await db
      .select({ count: count() })
      .from(ratings)
      .where(
        and(
          gte(ratings.timestamp, twoWeeksAgo),
          sql`${ratings.timestamp} < ${lastWeek}`,
          inArray(ratings.audioId, userAudioIds),
        ),
      );

    const thisWeek = lastWeekResult?.count || 0;
    const prevWeek = prevWeekResult?.count || 1;
    const ratingsTrend = Math.round(((thisWeek - prevWeek) / prevWeek) * 100);

    // Get active sessions (sessions started in last hour without completion)
    const oneHourAgo = new Date();

    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    // We can't strictly filter active sessions that have zero ratings, but we filter those with ratings for this user
    const userSessionIds = db
      .select({ id: ratings.sessionId })
      .from(ratings)
      .where(inArray(ratings.audioId, userAudioIds));

    const [activeSessionsResult] = await db
      .select({ count: count() })
      .from(evaluationSessions)
      .where(
        and(
          gte(evaluationSessions.startedAt, oneHourAgo),
          sql`${evaluationSessions.completedAt} IS NULL`,
          inArray(evaluationSessions.id, userSessionIds),
        ),
      );
    const activeSessions = activeSessionsResult?.count || 0;

    // Get completion rate
    const [totalSessionsResult] = await db
      .select({ count: count() })
      .from(evaluationSessions)
      .where(inArray(evaluationSessions.id, userSessionIds));

    const [completedSessionsResult] = await db
      .select({ count: count() })
      .from(evaluationSessions)
      .where(
        and(
          sql`${evaluationSessions.completedAt} IS NOT NULL`,
          inArray(evaluationSessions.id, userSessionIds),
        ),
      );

    const totalSessions = totalSessionsResult?.count || 1;
    const completedSessions = completedSessionsResult?.count || 0;
    const completionRate = Math.round(
      (completedSessions / totalSessions) * 100,
    );

    // Get total raters
    const userRaterIds = db
      .select({ id: ratings.raterId })
      .from(ratings)
      .where(inArray(ratings.audioId, userAudioIds));

    const [totalRatersResult] = await db
      .select({ count: count() })
      .from(raters)
      .where(inArray(raters.id, userRaterIds));
    const totalRaters = totalRatersResult?.count || 0;

    // Get total samples
    const [totalSamplesResult] = await db
      .select({ count: count() })
      .from(audioSamples)
      .where(
        and(
          eq(audioSamples.isActive, true),
          eq(audioSamples.uploadedBy, userId),
        ),
      );
    const totalSamples = totalSamplesResult?.count || 0;

    const [avgMosResult] = await db
      .select({ avg: avg(ratings.score) })
      .from(ratings)
      .where(inArray(ratings.audioId, userAudioIds));
    const avgMos = parseFloat(avgMosResult?.avg || "0").toFixed(2);

    const [avgTimeResult] = await db
      .select({ avg: avg(ratings.timeToRateMs) })
      .from(ratings)
      .where(inArray(ratings.audioId, userAudioIds));
    const avgTimeMs = avgTimeResult?.avg || 0;
    const avgTimeSeconds = Math.round(Number(avgTimeMs) / 1000);

    // Get total active languages
    const [totalLanguagesResult] = await db
      .select({ count: count() })
      .from(languages)
      .where(and(eq(languages.isActive, true), eq(languages.userId, userId)));
    const totalLanguages = totalLanguagesResult?.count || 0;

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
      totalLanguages,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
