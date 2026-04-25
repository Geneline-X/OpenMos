import { NextRequest, NextResponse } from "next/server";
import { eq, count, avg, desc, and } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

import { db } from "@/lib/db";
import { audioSamples, ratings } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

const utapi = new UTApi();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build conditions once, optionally adding language filter
    const conditions = [eq(audioSamples.uploadedBy, userId)];

    if (language) {
      conditions.push(eq(audioSamples.language, language));
    }

    const samples = await db
      .select({
        id: audioSamples.id,
        fileUrl: audioSamples.fileUrl,
        modelType: audioSamples.modelType,
        language: audioSamples.language,
        textContent: audioSamples.textContent,
        durationSeconds: audioSamples.durationSeconds,
        isActive: audioSamples.isActive,
        createdAt: audioSamples.createdAt,
        ratingCount: count(ratings.id),
        avgScore: avg(ratings.score),
      })
      .from(audioSamples)
      .leftJoin(ratings, eq(audioSamples.id, ratings.audioId))
      .where(and(...conditions))
      .groupBy(audioSamples.id)
      .orderBy(desc(audioSamples.createdAt))
      .limit(limit)
      .offset(offset);

    // Total count scoped to this user (ignores language filter for pagination)
    const [totalResult] = await db
      .select({ count: count() })
      .from(audioSamples)
      .where(eq(audioSamples.uploadedBy, userId));

    return NextResponse.json({
      samples: samples.map((s) => ({
        id: s.id,
        url: s.fileUrl,
        model: s.modelType,
        language: s.language,
        text: s.textContent,
        duration: s.durationSeconds
          ? `${parseFloat(s.durationSeconds)}s`
          : "N/A",
        isActive: s.isActive,
        createdAt: s.createdAt,
        ratings: s.ratingCount,
        avgScore: s.avgScore
          ? parseFloat(s.avgScore as string).toFixed(1)
          : "N/A",
      })),
      total: totalResult?.count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Samples fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch samples" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Sample ID is required" },
        { status: 400 },
      );
    }

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership FIRST — must happen before any deletion
    const [sample] = await db
      .select({ uploadthingKey: audioSamples.uploadthingKey })
      .from(audioSamples)
      .where(and(eq(audioSamples.id, id), eq(audioSamples.uploadedBy, userId)));

    if (!sample) {
      return NextResponse.json({ error: "Sample not found" }, { status: 404 });
    }

    // Remove associated ratings, then the sample itself
    await db.delete(ratings).where(eq(ratings.audioId, id));

    if (sample.uploadthingKey) {
      await utapi.deleteFiles(sample.uploadthingKey).catch((err) => {
        // Log but don't abort — the DB record must still be removed
        console.error("Failed to delete from UploadThing:", err);
      });
    }

    await db.delete(audioSamples).where(eq(audioSamples.id, id));

    return NextResponse.json({
      success: true,
      message: "Sample deleted from database and storage",
      deletedId: id,
    });
  } catch (error) {
    console.error("Sample delete error:", error);

    return NextResponse.json(
      { error: "Failed to delete sample" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, textContent } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Sample ID is required" },
        { status: 400 },
      );
    }

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [updated] = await db
      .update(audioSamples)
      .set({ textContent: textContent || null })
      .where(and(eq(audioSamples.id, id), eq(audioSamples.uploadedBy, userId)))
      .returning({
        id: audioSamples.id,
        textContent: audioSamples.textContent,
      });

    if (!updated) {
      return NextResponse.json({ error: "Sample not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, sample: updated });
  } catch (error) {
    console.error("Sample update error:", error);

    return NextResponse.json(
      { error: "Failed to update sample" },
      { status: 500 },
    );
  }
}
