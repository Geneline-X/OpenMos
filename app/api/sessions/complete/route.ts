import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { sessionToken } = await request.json();

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Session token required" },
        { status: 400 }
      );
    }

    // Mark session as completed
    const [updatedSession] = await db
      .update(sessions)
      .set({
        status: "completed",
        completedAt: new Date(),
        lastActivity: new Date(),
      })
      .where(
        and(
          eq(sessions.sessionToken, sessionToken),
          gt(sessions.expiresAt, new Date())
        )
      )
      .returning();

    if (!updatedSession) {
      return NextResponse.json(
        { success: false, error: "Session not found or expired" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        sessionToken: updatedSession.sessionToken,
        status: updatedSession.status,
        completedAt: updatedSession.completedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error completing session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to complete session" },
      { status: 500 }
    );
  }
}
