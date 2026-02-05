import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { sessionToken, currentSampleIndex } = await request.json();

    if (!sessionToken || currentSampleIndex === undefined) {
      return NextResponse.json(
        { success: false, error: "Session token and sample index required" },
        { status: 400 }
      );
    }

    // Update progress
    const [updatedSession] = await db
      .update(sessions)
      .set({
        currentSampleIndex,
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
        currentSampleIndex: updatedSession.currentSampleIndex,
        status: updatedSession.status,
      },
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
