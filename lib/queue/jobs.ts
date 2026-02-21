import type {
  EmailJobData,
  EvaluationJobData,
  AuditJobData,
  CleanupJobData,
  ReportJobData,
} from "./types";

import {
  emailQueue,
  evaluationQueue,
  auditQueue,
  cleanupQueue,
  reportQueue,
} from "./queues";

// ============================================
// JOB HELPERS - Use these to add jobs to queues
// ============================================

/**
 * Send an email asynchronously
 */
export async function queueEmail(
  data: EmailJobData,
  options?: { delay?: number },
) {
  return emailQueue.add(`email:${data.type}`, data, {
    delay: options?.delay,
  });
}

/**
 * Queue a password reset email
 */
export async function queuePasswordResetEmail(
  email: string,
  userName: string,
  resetUrl: string,
) {
  return queueEmail({
    type: "password-reset",
    to: email,
    data: { userName, resetUrl },
  });
}

/**
 * Queue an invitation email
 */
export async function queueInvitationEmail(
  email: string,
  inviteeName: string,
  inviteUrl: string,
  inviterName: string,
  role: string,
) {
  return queueEmail({
    type: "invitation",
    to: email,
    data: { inviteeName, inviteUrl, inviterName, role },
  });
}

/**
 * Queue access request notification (to admins)
 */
export async function queueAccessRequestNotification(
  adminEmail: string,
  requesterName: string,
  requesterEmail: string,
  institution: string,
  reason: string,
) {
  return queueEmail({
    type: "access-request",
    to: adminEmail,
    subject: "New Access Request - OpenMOS",
    data: { requesterName, requesterEmail, institution, reason },
  });
}

/**
 * Queue welcome email
 */
export async function queueWelcomeEmail(
  email: string,
  name: string,
  role: string,
) {
  return queueEmail({
    type: "welcome",
    to: email,
    data: { name, role },
  });
}

/**
 * Queue verification email
 */
export async function queueVerificationEmail(
  email: string,
  name: string,
  verificationUrl: string,
) {
  return queueEmail({
    type: "verify-email",
    to: email,
    data: { name, verificationUrl },
  });
}

/**
 * Process an evaluation rating
 */
export async function queueRatingProcess(data: EvaluationJobData) {
  return evaluationQueue.add(`evaluation:${data.type}`, data, {
    priority: data.type === "process-rating" ? 1 : 2, // Ratings have higher priority
  });
}

/**
 * Finalize a completed evaluation session
 */
export async function queueSessionFinalization(sessionId: string) {
  return evaluationQueue.add(
    "evaluation:finalize-session",
    {
      type: "finalize-session",
      sessionId,
    },
    {
      delay: 5000, // Wait 5 seconds to batch any last ratings
    },
  );
}

/**
 * Log an audit event asynchronously
 */
export async function queueAuditLog(data: AuditJobData) {
  return auditQueue.add(`audit:${data.action}`, data);
}

/**
 * Schedule a cleanup job
 */
export async function queueCleanup(
  data: CleanupJobData,
  options?: { delay?: number },
) {
  return cleanupQueue.add(`cleanup:${data.type}`, data, {
    delay: options?.delay,
  });
}

/**
 * Schedule expired sessions cleanup (run daily)
 */
export async function scheduleSessionCleanup() {
  // Remove existing scheduled job if any
  const existingJobs = await cleanupQueue.getRepeatableJobs();

  for (const job of existingJobs) {
    if (job.name === "cleanup:expire-sessions") {
      await cleanupQueue.removeRepeatableByKey(job.key);
    }
  }

  // Schedule to run every day at 3 AM
  return cleanupQueue.add(
    "cleanup:expire-sessions",
    { type: "expire-sessions" },
    {
      repeat: {
        pattern: "0 3 * * *", // Cron: 3 AM daily
      },
    },
  );
}

/**
 * Queue a report generation
 */
export async function queueReport(data: ReportJobData) {
  return reportQueue.add(`report:${data.type}`, data);
}

/**
 * Export evaluation data
 */
export async function queueEvaluationExport(
  requestedBy: string,
  filters?: ReportJobData["filters"],
  format: "csv" | "json" | "pdf" = "csv",
) {
  return queueReport({
    type: "export-evaluations",
    requestedBy,
    filters,
    format,
  });
}
