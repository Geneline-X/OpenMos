import { NextResponse } from "next/server";
import { eq, and, gt } from "drizzle-orm";

import { db } from "@/lib/db";
import { sessions, evaluationSessions } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const { sessionToken } = await request.json();

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Session token required" },
        { status: 400 },
      );
    }

    // Find and validate session
    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.sessionToken, sessionToken),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found or expired" },
        { status: 404 },
      );
    }

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

    // Update last activity
    await db
      .update(sessions)
      .set({ lastActivity: new Date() })
      .where(eq(sessions.id, session.id));

    return NextResponse.json({
      success: true,
      session: {
        sessionToken: session.sessionToken,
        raterId: session.raterId,
        currentSampleIndex: session.currentSampleIndex,
        totalSamples,
        createdAt: session.createdAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
        status: session.status,
      },
    });
  } catch (error) {
    console.error("Error validating session:", error);

    return NextResponse.json(
      { success: false, error: "Failed to validate session" },
      { status: 500 },
    );
  }
}
