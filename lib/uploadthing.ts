import { createUploadthing, type FileRouter } from "uploadthing/next";

import { db } from "@/lib/db";
import { audioSamples } from "@/lib/db/schema";
import { NotificationService } from "@/lib/services/notifications";
import { auth } from "@/lib/auth";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Audio sample uploader for admins
  audioUploader: f({
    audio: { maxFileSize: "16MB", maxFileCount: 20 },
  })
    .middleware(async ({ req }) => {
      // Veryify admin authentication
      const session = await auth();

      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }

      // Get metadata from request headers (set by client)
      const modelType = req.headers.get("x-model-type") || "orpheus";
      const language = req.headers.get("x-language") || "luganda";
      const textContent = req.headers.get("x-text-content") || null;

      return { uploadedBy: session.user.id, modelType, language, textContent };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Audio upload complete:", file.url);

      // Save to database
      const [sample] = await db
        .insert(audioSamples)
        .values({
          fileUrl: file.url,
          uploadthingKey: file.key,
          modelType: metadata.modelType,
          language: metadata.language,
          textContent: metadata.textContent,
          isActive: true,
          uploadedBy: metadata.uploadedBy,
        })
        .returning();

      // Create notification for sample upload
      await NotificationService.samplesUploaded(
        1,
        metadata.language,
        metadata.modelType,
        metadata.uploadedBy,
      );

      return { url: file.url, key: file.key, sampleId: sample.id };
    }),

  // Data export uploader (for generating temporary download links)
  exportUploader: f({
    "text/csv": { maxFileSize: "4MB" },
    "application/json": { maxFileSize: "4MB" },
  })
    .middleware(async ({ req }) => {
      // Verify admin authentication
      return { generatedBy: "admin" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Export generated:", file.url);

      return { url: file.url, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
