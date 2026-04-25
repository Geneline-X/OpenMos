import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Single DB round-trip via fn_get_user_dashboard_stats (migration 0003).
    // Replaces the previous 8 separate COUNT/AVG queries.
    const rows = await db.execute(
      sql`SELECT * FROM fn_get_user_dashboard_stats(${userId}::uuid)`,
    );

    const row = rows.rows?.[0] as Record<string, unknown> | undefined;

    if (!row) {
      return NextResponse.json(
        { error: "Failed to load stats" },
        { status: 500 },
      );
    }

    const thisWeek = Number(row.this_week_ratings) || 0;
    const prevWeek = Number(row.prev_week_ratings) || 1;
    const ratingsTrend = Math.round(((thisWeek - prevWeek) / prevWeek) * 100);

    const totalSessions = Number(row.total_sessions) || 1;
    const completedSessions = Number(row.completed_sessions) || 0;
    const completionRate = Math.round((completedSessions / totalSessions) * 100);

    const avgTimeSeconds = Math.round(Number(row.avg_time_ms || 0) / 1000);

    return NextResponse.json({
      totalRatings: Number(row.total_ratings) || 0,
      ratingsToday: Number(row.ratings_today) || 0,
      ratingsTrend,
      activeSessions: Number(row.active_sessions) || 0,
      avgSessionDuration: "N/A",
      completionRate,
      completionTrend: 0,
      avgDuration: `${avgTimeSeconds}s`,
      durationDiff: "",
      totalRaters: Number(row.total_raters) || 0,
      totalSamples: Number(row.total_samples) || 0,
      avgMos: row.avg_mos ? String(row.avg_mos) : "0.00",
      totalLanguages: Number(row.total_languages) || 0,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
