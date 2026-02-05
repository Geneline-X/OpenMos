import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, evaluationSessions } from "@/lib/db/schema";
import { eq, and, gt, ne } from "drizzle-orm";
import { getSessionExpiry } from "@/lib/auth/utils";

export async function POST(request: Request) {
  try {
    const { sessionToken } = await request.json();

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Session token required" },
        { status: 400 }
      );
    }

    // Find session that is active and not expired
    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.sessionToken, sessionToken),
          gt(sessions.expiresAt, new Date()),
          ne(sessions.status, "completed")
        )
      )
      .limit(1);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "No active session to resume" },
        { status: 404 }
      );
    }

    // Extend expiry and update activity
    const newExpiry = getSessionExpiry(7);
    const [updatedSession] = await db
      .update(sessions)
      .set({
        expiresAt: newExpiry,
        lastActivity: new Date(),
      })
      .where(eq(sessions.id, session.id))
      .returning();

    // Get evaluation session for total samples count
    let totalSamples = 20;
    if (session.raterId) {
      const [evalSession] = await db
        .select()
        .from(evaluationSessions)
        .where(eq(evaluationSessions.raterId, session.raterId))
        .orderBy(evaluationSessions.startedAt)
        .limit(1);

      if (evalSession) {
        totalSamples = evalSession.totalSamples;
      }
    }

    return NextResponse.json({
      success: true,
      session: {
        sessionToken: updatedSession.sessionToken,
        raterId: updatedSession.raterId,
        currentSampleIndex: updatedSession.currentSampleIndex,
        totalSamples,
        createdAt: updatedSession.createdAt.toISOString(),
        expiresAt: updatedSession.expiresAt.toISOString(),
        status: updatedSession.status,
      },
    });
  } catch (error) {
    console.error("Error resuming session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resume session" },
      { status: 500 }
    );
  }
}
