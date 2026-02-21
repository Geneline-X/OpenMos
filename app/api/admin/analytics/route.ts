import { NextRequest, NextResponse } from "next/server";
import { sql, eq, count, desc, inArray, and } from "drizzle-orm";

import { db } from "@/lib/db";
import { ratings, audioSamples, raters } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userAudioIds = db
      .select({ id: audioSamples.id })
      .from(audioSamples)
      .where(eq(audioSamples.uploadedBy, userId));

    // 1. MOS Comparison by Model Type
    const mosComparison = await db
      .select({
        modelType: audioSamples.modelType,
        mean: sql<number>`ROUND(AVG(${ratings.score})::numeric, 2)`,
        stdDev: sql<number>`ROUND(STDDEV(${ratings.score})::numeric, 2)`,
        n: count(),
      })
      .from(ratings)
      .innerJoin(audioSamples, eq(ratings.audioId, audioSamples.id))
      .where(eq(audioSamples.uploadedBy, userId))
      .groupBy(audioSamples.modelType)
      .orderBy(desc(sql`AVG(${ratings.score})`));

    // Calculate 95% CI for each model
    const mosData = mosComparison.map((row, index) => {
      const mean = parseFloat(String(row.mean)) || 0;
      const stdDev = parseFloat(String(row.stdDev)) || 0;
      const n = row.n || 1;
      const marginOfError = 1.96 * (stdDev / Math.sqrt(n));

      // Assign colors based on model type or index
      const colors = ["#10b981", "#1e40af", "#f59e0b", "#8b5cf6", "#ef4444"];

      return {
        name: row.modelType || "Unknown",
        mean,
        stdDev,
        ciLower: parseFloat((mean - marginOfError).toFixed(2)),
        ciUpper: parseFloat((mean + marginOfError).toFixed(2)),
        n,
        pValue: index === 0 ? null : "< 0.05", // First is reference, others have p-values
        color: colors[index % colors.length],
      };
    });

    // 2. Rating Distribution by Model
    const ratingDistribution = await db
      .select({
        modelType: audioSamples.modelType,
        score: ratings.score,
        count: count(),
      })
      .from(ratings)
      .innerJoin(audioSamples, eq(ratings.audioId, audioSamples.id))
      .where(eq(audioSamples.uploadedBy, userId))
      .groupBy(audioSamples.modelType, ratings.score)
      .orderBy(audioSamples.modelType, ratings.score);

    // Transform into the format needed by the chart
    const modelRatings: Record<string, number[]> = {};
    const modelColors: Record<string, string> = {};
    const colors = ["#10b981", "#1e40af", "#f59e0b", "#8b5cf6", "#ef4444"];
    let colorIndex = 0;

    ratingDistribution.forEach((row) => {
      const model = row.modelType || "Unknown";

      if (!modelRatings[model]) {
        modelRatings[model] = [0, 0, 0, 0, 0]; // Scores 1-5
        modelColors[model] = colors[colorIndex % colors.length];
        colorIndex++;
      }
      if (row.score >= 1 && row.score <= 5) {
        modelRatings[model][row.score - 1] = row.count;
      }
    });

    const distributionData = Object.entries(modelRatings).map(
      ([model, ratings]) => ({
        model,
        color: modelColors[model],
        ratings,
      }),
    );

    // 3. Progress Timeline - Last 7 days of ratings
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRatings = await db
      .select({
        date: sql<string>`DATE(${ratings.timestamp})`,
        daily: count(),
      })
      .from(ratings)
      .where(
        and(
          sql`${ratings.timestamp} >= ${sevenDaysAgo}`,
          inArray(ratings.audioId, userAudioIds),
        ),
      )
      .groupBy(sql`DATE(${ratings.timestamp})`)
      .orderBy(sql`DATE(${ratings.timestamp})`);

    // Fill in missing days and calculate cumulative
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const progressData: { date: string; cumulative: number; daily: number }[] =
      [];

    // Get total ratings before this period for cumulative
    const [beforePeriodResult] = await db
      .select({ count: count() })
      .from(ratings)
      .where(
        and(
          sql`${ratings.timestamp} < ${sevenDaysAgo}`,
          inArray(ratings.audioId, userAudioIds),
        ),
      );

    let cumulative = beforePeriodResult?.count || 0;

    // Create a map of date -> count
    const dailyMap = new Map(dailyRatings.map((r) => [r.date, r.daily]));

    // Generate last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);

      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = days[date.getDay()];
      const daily = dailyMap.get(dateStr) || 0;

      cumulative += daily;

      progressData.push({
        date: dayName,
        cumulative,
        daily,
      });
    }

    // 4. Demographics breakdown
    const userRaterIds = db
      .select({ id: ratings.raterId })
      .from(ratings)
      .where(inArray(ratings.audioId, userAudioIds));

    const genderStats = await db
      .select({
        gender: raters.gender,
        count: count(),
      })
      .from(raters)
      .where(inArray(raters.id, userRaterIds))
      .groupBy(raters.gender);

    const ageStats = await db
      .select({
        ageGroup: sql<string>`
          CASE 
            WHEN ${raters.age} < 25 THEN '18-24'
            WHEN ${raters.age} < 35 THEN '25-34'
            WHEN ${raters.age} < 45 THEN '35-44'
            WHEN ${raters.age} < 55 THEN '45-54'
            ELSE '55+'
          END
        `,
        count: count(),
      })
      .from(raters)
      .where(inArray(raters.id, userRaterIds)).groupBy(sql`
        CASE 
          WHEN ${raters.age} < 25 THEN '18-24'
          WHEN ${raters.age} < 35 THEN '25-34'
          WHEN ${raters.age} < 45 THEN '35-44'
          WHEN ${raters.age} < 55 THEN '45-54'
          ELSE '55+'
        END
      `);

    const languageStats = await db
      .select({
        language: raters.nativeLanguage,
        count: count(),
      })
      .from(raters)
      .where(inArray(raters.id, userRaterIds))
      .groupBy(raters.nativeLanguage);

    // Get target from total samples * desired ratings per sample
    const [samplesResult] = await db
      .select({ count: count() })
      .from(audioSamples)
      .where(
        and(
          eq(audioSamples.isActive, true),
          eq(audioSamples.uploadedBy, userId),
        ),
      );
    const totalSamples = samplesResult?.count || 0;
    const targetRatings = totalSamples * 10; // 10 ratings per sample target

    return NextResponse.json({
      mosComparison: mosData,
      ratingDistribution: distributionData,
      progressTimeline: {
        data: progressData,
        target: targetRatings || 500,
        current: cumulative,
      },
      demographics: {
        gender: genderStats,
        age: ageStats,
        language: languageStats,
      },
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
