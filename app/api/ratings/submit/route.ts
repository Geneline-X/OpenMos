import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ratings, evaluationSessions } from "@/lib/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { NotificationService } from "@/lib/services/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      sessionId, 
      raterId, 
      audioId, 
      score, 
      timeToRateMs, 
      playbackCount,
      isLastSample,
      language,
    } = body;

    // Validate input
    if (!sessionId || !raterId || !audioId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!score || score < 1 || score > 5) {
      return NextResponse.json(
        { error: "Invalid score - must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Insert rating
    const [rating] = await db
      .insert(ratings)
      .values({
        sessionId,
        raterId,
        audioId,
        score,
        timeToRateMs: timeToRateMs || null,
        playbackCount: playbackCount || 1,
        userAgent: request.headers.get("user-agent") || null,
      })
      .returning();

    // Update session progress
    const [updatedSession] = await db
      .update(evaluationSessions)
      .set({
        completedCount: sql`${evaluationSessions.completedCount} + 1`,
        currentSampleIndex: sql`${evaluationSessions.currentSampleIndex} + 1`,
        completedAt: isLastSample ? new Date() : undefined,
      })
      .where(eq(evaluationSessions.id, sessionId))
      .returning();

    // If this was the last sample, create completion notification
    if (isLastSample && updatedSession) {
      await NotificationService.raterCompleted(
        raterId,
        language || "Unknown",
        updatedSession.totalSamples
      );
    }

    // Check for rating milestones (every 100 ratings)
    const [totalRatingsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(ratings);
    
    const totalRatings = totalRatingsResult?.count || 0;
    if (totalRatings > 0 && totalRatings % 100 === 0) {
      await NotificationService.ratingMilestone(totalRatings);
    }

    return NextResponse.json({
      success: true,
      ratingId: rating.id,
    });
  } catch (error) {
    console.error("Rating submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}
