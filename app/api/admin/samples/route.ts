import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audioSamples, ratings } from "@/lib/db/schema";
import { eq, count, avg, desc, sql } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Base query for samples with aggregated rating data
    let query = db
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
      .groupBy(audioSamples.id)
      .orderBy(desc(audioSamples.createdAt))
      .limit(limit)
      .offset(offset);

    // Apply language filter if provided
    const samples = language
      ? await db
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
          .where(eq(audioSamples.language, language))
          .groupBy(audioSamples.id)
          .orderBy(desc(audioSamples.createdAt))
          .limit(limit)
          .offset(offset)
      : await query;

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(audioSamples);

    return NextResponse.json({
      samples: samples.map((s) => ({
        id: s.id,
        url: s.fileUrl,
        model: s.modelType,
        language: s.language,
        text: s.textContent,
        duration: s.durationSeconds ? `${parseFloat(s.durationSeconds)}s` : "N/A",
        isActive: s.isActive,
        createdAt: s.createdAt,
        ratings: s.ratingCount,
        avgScore: s.avgScore ? parseFloat(s.avgScore as string).toFixed(1) : "N/A",
      })),
      total: totalResult?.count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Samples fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch samples" },
      { status: 500 }
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
        { status: 400 }
      );
    }

    // Delete the sample (ratings will cascade due to FK or we handle manually)
    // First delete associated ratings
    await db.delete(ratings).where(eq(ratings.audioId, id));
    
    // Get the sample first to retrieve the uploadthing key
    const [sample] = await db
      .select({ uploadthingKey: audioSamples.uploadthingKey })
      .from(audioSamples)
      .where(eq(audioSamples.id, id));

    if (!sample) {
      return NextResponse.json(
        { error: "Sample not found" },
        { status: 404 }
      );
    }

    // Delete from UploadThing storage if we have the key
    if (sample.uploadthingKey) {
      try {
        await utapi.deleteFiles(sample.uploadthingKey);
        console.log(`Deleted file from UploadThing: ${sample.uploadthingKey}`);
      } catch (utError) {
        console.error("Failed to delete from UploadThing:", utError);
        // Continue with DB deletion even if UploadThing fails
      }
    }

    // Then delete the sample from database
    const [deleted] = await db
      .delete(audioSamples)
      .where(eq(audioSamples.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Sample deleted from database and storage",
      deletedId: id,
    });
  } catch (error) {
    console.error("Sample delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete sample" },
      { status: 500 }
    );
  }
}
