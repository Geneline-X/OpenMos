import { Queue } from "bullmq";

import { connection } from "./connection";

// ============================================
// QUEUE DEFINITIONS
// ============================================

/**
 * Email Queue - For sending transactional emails
 * - Password reset emails
 * - Invitation emails
 * - Notification emails
 */
export const emailQueue = new Queue("email", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000, // 1s, 2s, 4s
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

/**
 * Evaluation Queue - For processing evaluation submissions
 * - Aggregate scores
 * - Calculate MOS statistics
 * - Update sample ratings
 */
export const evaluationQueue = new Queue("evaluation", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // 1 hour
      count: 500,
    },
    removeOnFail: {
      age: 7 * 24 * 3600,
    },
  },
});

/**
 * Audit Queue - For logging audit events
 * - Login attempts
 * - Admin actions
 * - Security events
 */
export const auditQueue = new Queue("audit", {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "fixed",
      delay: 500,
    },
    removeOnComplete: {
      age: 3600,
      count: 2000,
    },
    removeOnFail: {
      age: 30 * 24 * 3600, // 30 days for failed audit logs
    },
  },
});

/**
 * Cleanup Queue - For maintenance tasks
 * - Expire old sessions
 * - Clean up temporary files
 * - Archive old data
 */
export const cleanupQueue = new Queue("cleanup", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: true,
    removeOnFail: {
      age: 24 * 3600,
    },
  },
});

/**
 * Report Queue - For generating reports
 * - Export evaluation data
 * - Generate statistics
 * - Create CSV/PDF exports
 */
export const reportQueue = new Queue("report", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 3600,
      count: 100,
    },
    removeOnFail: {
      age: 7 * 24 * 3600,
    },
  },
});

// Export all queues
export const queues = {
  email: emailQueue,
  evaluation: evaluationQueue,
  audit: auditQueue,
  cleanup: cleanupQueue,
  report: reportQueue,
};
