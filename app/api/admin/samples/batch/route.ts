import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { audioSamples } from "@/lib/db/schema";
import { NotificationService } from "@/lib/services/notifications";

const utapi = new UTApi();

const MAX_BATCH_SIZE = 30;

interface BatchFile {
  url: string;
  key: string;
  modelType: string;
  language: string;
  textContent?: string | null;
  studyId?: string | null;
}

/**
 * POST /api/admin/samples/batch
 *
 * Atomically saves a batch of already-uploaded audio files to the database.
 * Uses a single INSERT statement so all rows succeed or none do (PostgreSQL
 * atomicity). If the INSERT fails, all files are removed from UploadThing
 * storage so nothing is left orphaned.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let files: BatchFile[];

  try {
    const body = await request.json();
    files = body.files;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  if (files.length > MAX_BATCH_SIZE) {
    return NextResponse.json(
      { error: `Maximum ${MAX_BATCH_SIZE} files per batch` },
      { status: 400 },
    );
  }

  // Validate required fields before touching the database
  for (const file of files) {
    if (!file.url || !file.key || !file.modelType || !file.language) {
      return NextResponse.json(
        { error: "Each file must include url, key, modelType, and language" },
        { status: 400 },
      );
    }
  }

  try {
    // Single INSERT — atomic in PostgreSQL. If any row fails, nothing is inserted.
    const inserted = await db
      .insert(audioSamples)
      .values(
        files.map((file) => ({
          fileUrl: file.url,
          uploadthingKey: file.key,
          modelType: file.modelType,
          language: file.language,
          textContent: file.textContent ?? null,
          isActive: true,
          uploadedBy: userId,
          studyId: file.studyId ?? null,
        })),
      )
      .returning({ id: audioSamples.id });

    // One notification for the whole batch (non-blocking)
    NotificationService.samplesUploaded(
      files.length,
      files[0].language,
      files[0].modelType,
      userId,
    ).catch(console.error);

    return NextResponse.json({ success: true, saved: inserted.length });
  } catch (error) {
    console.error("Batch save error:", error);

    // DB insert failed — remove the already-uploaded files from UploadThing
    // so storage doesn't accumulate orphaned files
    const keys = files.map((f) => f.key).filter(Boolean);

    if (keys.length > 0) {
      utapi.deleteFiles(keys).catch((utErr) => {
        console.error("Failed to clean up UploadThing files after batch failure:", utErr);
      });
    }

    return NextResponse.json(
      { error: "Failed to save samples — uploaded files have been removed" },
      { status: 500 },
    );
  }
}
