import { Worker, Job } from "bullmq";
import { createConnection } from "../connection";
import { db } from "@/lib/db";
import { sessions, passwordResetTokens, adminInvitations } from "@/lib/db/schema";
import { lt, and, isNull } from "drizzle-orm";
import type { CleanupJobData } from "../types";

export function createCleanupWorker() {
  const worker = new Worker<CleanupJobData>(
    "cleanup",
    async (job: Job<CleanupJobData>) => {
      const { type } = job.data;
      
      console.log(`🧹 Processing cleanup job: ${type}`);
      
      switch (type) {
        case "expire-sessions": {
          // Delete sessions older than 30 days or expired
          const result = await db
            .delete(sessions)
            .where(
              lt(sessions.expiresAt, new Date())
            )
            .returning({ id: sessions.id });

          console.log(`Cleaned up ${result.length} expired sessions`);
          return { deleted: result.length, type: "sessions" };
        }

        case "expire-reset-tokens": {
          // Delete expired password reset tokens
          const result = await db
            .delete(passwordResetTokens)
            .where(
              lt(passwordResetTokens.expiresAt, new Date())
            )
            .returning({ id: passwordResetTokens.id });

          console.log(`Cleaned up ${result.length} expired reset tokens`);
          return { deleted: result.length, type: "reset-tokens" };
        }

        case "expire-invitations": {
          // Delete expired invitations (those not yet accepted)
          const result = await db
            .delete(adminInvitations)
            .where(
              and(
                lt(adminInvitations.expiresAt, new Date()),
                isNull(adminInvitations.acceptedAt)
              )
            )
            .returning({ id: adminInvitations.id });

          console.log(`Cleaned up ${result.length} expired invitations`);
          return { deleted: result.length, type: "invitations" };
        }

        case "archive-evaluations": {
          // Archive old completed evaluations (move to archive table or external storage)
          // For now, just log
          console.log("Archiving old evaluations...");
          return { archived: 0, type: "evaluations" };
        }

        case "cleanup-temp-files": {
          // Clean up temporary uploaded files
          // Integrate with UploadThing cleanup if needed
          console.log("Cleaning up temporary files...");
          return { deleted: 0, type: "temp-files" };
        }

        default:
          throw new Error(`Unknown cleanup job type: ${type}`);
      }
    },
    {
      connection: createConnection(),
      concurrency: 1, // Run cleanup jobs sequentially
    }
  );

  worker.on("completed", (job) => {
    console.log(`✅ Cleanup completed: ${job.data.type} (${job.id})`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Cleanup failed: ${job?.data.type} - ${err.message}`);
  });

  return worker;
}
