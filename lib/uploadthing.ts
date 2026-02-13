import { createUploadthing, type FileRouter } from "uploadthing/next";

import { db } from "@/lib/db";
import { audioSamples } from "@/lib/db/schema";
import { NotificationService } from "@/lib/services/notifications";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Audio sample uploader for admins
  audioUploader: f({
    audio: { maxFileSize: "16MB", maxFileCount: 20 },
  })
    .middleware(async ({ req }) => {
      // In production, verify admin authentication here
      // const admin = await verifyAdminSession(req);
      // if (!admin) throw new UploadThingError("Unauthorized");

      // Get metadata from request headers (set by client)
      const modelType = req.headers.get("x-model-type") || "orpheus";
      const language = req.headers.get("x-language") || "luganda";

      return { uploadedBy: "admin", modelType, language };
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
          isActive: true,
        })
        .returning();

      // Create notification for sample upload
      await NotificationService.samplesUploaded(
        1,
        metadata.language,
        metadata.modelType,
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
