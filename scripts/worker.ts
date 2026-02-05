/**
 * BullMQ Worker Process
 * 
 * Run this as a separate process to handle background jobs:
 *   bun run scripts/worker.ts
 * 
 * In production, run this alongside your Next.js app or as a separate service.
 */

import {
  createEmailWorker,
  createAuditWorker,
  createEvaluationWorker,
  createCleanupWorker,
  createReportWorker,
  scheduleSessionCleanup,
} from "@/lib/queue";

console.log("🚀 Starting BullMQ Workers...\n");

// Create all workers
const workers = [
  createEmailWorker(),
  createAuditWorker(),
  createEvaluationWorker(),
  createCleanupWorker(),
  createReportWorker(),
];

console.log("✅ Workers started:");
console.log("   - Email Worker (5 concurrent)");
console.log("   - Audit Worker (10 concurrent)");
console.log("   - Evaluation Worker (3 concurrent)");
console.log("   - Cleanup Worker (1 concurrent)");
console.log("   - Report Worker (2 concurrent)");

// Schedule recurring jobs
scheduleSessionCleanup().then(() => {
  console.log("📅 Scheduled: Session cleanup (daily at 3 AM)");
});

console.log("\n🎧 Listening for jobs...\n");

// Graceful shutdown
async function shutdown() {
  console.log("\n⏳ Shutting down workers...");
  
  await Promise.all(workers.map((w) => w.close()));
  
  console.log("👋 Workers stopped. Goodbye!");
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
