import { Worker, Job } from "bullmq";
import { createConnection } from "../connection";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import type { AuditJobData } from "../types";

export function createAuditWorker() {
  const worker = new Worker<AuditJobData>(
    "audit",
    async (job: Job<AuditJobData>) => {
      const { action, userId, targetId, targetType, details, ipAddress, userAgent } = job.data;
      
      console.log(`📝 Processing audit job: ${action}`);
      
      // Map our job action to schema AuditAction
      const actionMap: Record<string, string> = {
        "login": "login_success",
        "logout": "logout",
        "login_failed": "login_failed",
        "password_reset": "password_reset_request",
        "user_created": "create_user",
        "user_updated": "update_user",
        "user_deleted": "delete_user",
        "settings_changed": "change_permissions",
        "sample_uploaded": "upload_sample",
        "sample_deleted": "delete_sample",
        "export_data": "export_data",
      };

      const schemaAction = actionMap[action] || action;

      // Insert audit log into database
      const [log] = await db.insert(auditLogs).values({
        action: schemaAction as typeof auditLogs.$inferInsert.action,
        adminId: userId || null,
        resourceId: targetId || null,
        resourceType: targetType || null,
        metadata: details || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      }).returning();
      
      return { logged: true, logId: log.id };
    },
    {
      connection: createConnection(),
      concurrency: 10, // High concurrency for audit logs
    }
  );

  worker.on("completed", (job) => {
    console.log(`✅ Audit logged: ${job.data.action} (${job.id})`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Audit failed: ${job?.data.action} - ${err.message}`);
  });

  return worker;
}
