import { NextRequest, NextResponse } from "next/server";
import { eq, desc, count, avg, gte } from "drizzle-orm";

import { db } from "@/lib/db";
import { ratings, audioSamples, raters } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get ratings with joined sample and rater info
    const ratingsData = await db
      .select({
        id: ratings.id,
        score: ratings.score,
        timeToRateMs: ratings.timeToRateMs,
        playbackCount: ratings.playbackCount,
        timestamp: ratings.timestamp,
        sampleId: audioSamples.id,
        modelType: audioSamples.modelType,
        language: audioSamples.language,
        raterId: raters.id,
      })
      .from(ratings)
      .leftJoin(audioSamples, eq(ratings.audioId, audioSamples.id))
      .leftJoin(raters, eq(ratings.raterId, raters.id))
      .orderBy(desc(ratings.timestamp))
      .limit(limit)
      .offset(offset);

    // Get totals
    const [totalResult] = await db.select({ count: count() }).from(ratings);

    const [avgResult] = await db
      .select({ avg: avg(ratings.score) })
      .from(ratings);

    const [avgTimeResult] = await db
      .select({ avg: avg(ratings.timeToRateMs) })
      .from(ratings);

    // Get today's count
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    const [todayResult] = await db
      .select({ count: count() })
      .from(ratings)
      .where(gte(ratings.timestamp, today));

    // Format the response
    const formattedRatings = ratingsData.map((r) => {
      const timeAgo = getTimeAgo(r.timestamp);

      return {
        id: r.id,
        sample: r.sampleId
          ? `${r.language?.slice(0, 3)}_${r.modelType}_${r.sampleId.slice(0, 3)}`
          : "Unknown",
        model: r.modelType || "Unknown",
        score: r.score,
        rater: `#${r.raterId?.slice(-2) || "??"}`,
        time: r.timeToRateMs ? `${Math.round(r.timeToRateMs / 1000)}s` : "N/A",
        date: timeAgo,
        timestamp: r.timestamp,
      };
    });

    return NextResponse.json({
      ratings: formattedRatings,
      total: totalResult?.count || 0,
      avgScore: avgResult?.avg
        ? parseFloat(avgResult.avg as string).toFixed(2)
        : "0.00",
      avgTime: avgTimeResult?.avg
        ? `${Math.round(Number(avgTimeResult.avg) / 1000)}s`
        : "0s",
      today: todayResult?.count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Ratings fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 },
    );
  }
}

function getTimeAgo(date: Date | null): string {
  if (!date) return "Unknown";

  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(date).toLocaleDateString();
}
