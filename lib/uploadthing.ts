import { createUploadthing, type FileRouter } from "uploadthing/next";

import { auth } from "@/lib/auth";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Audio sample uploader for admins — max 30 files, 16 MB each
  audioUploader: f({
    audio: { maxFileSize: "16MB", maxFileCount: 30 },
  })
    .middleware(async ({ req }) => {
      // Verify admin authentication
      const session = await auth();

      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }

      // Capture upload metadata from request headers (set by the client)
      const modelType = req.headers.get("x-model-type") || "orpheus";
      const language = req.headers.get("x-language") || "luganda";
      const textContent = req.headers.get("x-text-content") || null;
      const studyId = req.headers.get("x-study-id") || null;

      return {
        uploadedBy: session.user.id,
        modelType,
        language,
        textContent,
        studyId,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Do NOT insert into the DB here — the client will call /api/admin/samples/batch
      // once all files have finished uploading, inserting everything atomically in one
      // shot. If any single file fails the batch, none are persisted.
      return {
        url: file.url,
        key: file.key,
        modelType: metadata.modelType,
        language: metadata.language,
        textContent: metadata.textContent,
        studyId: metadata.studyId,
      };
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
