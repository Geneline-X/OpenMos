import { randomUUID } from "crypto";

import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { db } from "@/lib/db";
import { raters, evaluationSessions, audioSamples } from "@/lib/db/schema";
import { isValidLanguage } from "@/config/languages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { age, gender, nativeLanguage } = body;

    // Validate input
    if (!nativeLanguage || !isValidLanguage(nativeLanguage)) {
      return NextResponse.json(
        { error: "Invalid or missing native language" },
        { status: 400 },
      );
    }

    if (!age || age < 18 || age > 120) {
      return NextResponse.json(
        { error: "Invalid age - must be 18 or older" },
        { status: 400 },
      );
    }

    if (!gender) {
      return NextResponse.json(
        { error: "Gender is required" },
        { status: 400 },
      );
    }

    // Get IP hash for duplicate detection (anonymized)
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    const ipHash = Buffer.from(ip).toString("base64").slice(0, 16);

    // Create rater record
    const [rater] = await db
      .insert(raters)
      .values({
        age,
        gender,
        nativeLanguage,
        ipHash,
      })
      .returning();

    // Get available samples for this language
    const samples = await db
      .select()
      .from(audioSamples)
      .where(
        and(
          eq(audioSamples.language, nativeLanguage),
          eq(audioSamples.isActive, true),
        ),
      );

    // Determine total samples (minimum of available or 20)
    const totalSamples = Math.min(samples.length || 5, 20);

    // Create evaluation session
    const [session] = await db
      .insert(evaluationSessions)
      .values({
        raterId: rater.id,
        totalSamples: totalSamples,
        deviceType: request.headers.get("user-agent")?.includes("Mobile")
          ? "mobile"
          : "desktop",
        browserType: request.headers.get("user-agent") || "unknown",
      })
      .returning();

    // Generate session token
    const sessionToken = randomUUID();

    // Shuffle samples for randomization (Fisher-Yates)
    const shuffledSamples = [...samples];

    for (let i = shuffledSamples.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [shuffledSamples[i], shuffledSamples[j]] = [
        shuffledSamples[j],
        shuffledSamples[i],
      ];
    }

    // Store sample order in response (for client-side tracking)
    const sampleOrder = shuffledSamples.slice(0, totalSamples).map((s) => ({
      id: s.id,
      url: s.fileUrl,
    }));

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      sessionId: session.id,
      raterId: rater.id,
      token: sessionToken,
      totalSamples: totalSamples,
      samples: sampleOrder,
      language: nativeLanguage,
    });

    // Set session cookie for middleware authentication
    response.cookies.set("openmos_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Session creation error:", error);

    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
}
