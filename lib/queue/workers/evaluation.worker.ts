import type { EvaluationJobData } from "../types";

import { Worker, Job } from "bullmq";
import { eq, sql } from "drizzle-orm";

import { createConnection } from "../connection";

import { db } from "@/lib/db";
import { evaluationSessions, ratings } from "@/lib/db/schema";

export function createEvaluationWorker() {
  const worker = new Worker<EvaluationJobData>(
    "evaluation",
    async (job: Job<EvaluationJobData>) => {
      const { type, sessionId, sampleId } = job.data;

      console.log(`🎯 Processing evaluation job: ${type}`);

      switch (type) {
        case "process-rating":
          // Update sample's aggregated score after a new rating
          if (sampleId) {
            // Calculate new MOS score for the sample
            const result = await db
              .select({
                avgScore: sql<number>`AVG(${ratings.score})::decimal(3,2)`,
                count: sql<number>`COUNT(*)`,
              })
              .from(ratings)
              .where(eq(ratings.audioId, sampleId));

            console.log(
              `Sample ${sampleId}: avg=${result[0]?.avgScore}, count=${result[0]?.count}`,
            );
          }

          return { processed: true, sampleId };

        case "finalize-session":
          // Mark session as completed and calculate stats
          if (sessionId) {
            const sessionRatings = await db
              .select()
              .from(ratings)
              .where(eq(ratings.sessionId, sessionId));

            await db
              .update(evaluationSessions)
              .set({
                completedAt: new Date(),
                completedCount: sessionRatings.length,
              })
              .where(eq(evaluationSessions.id, sessionId));

            return {
              finalized: true,
              sessionId,
              totalRatings: sessionRatings.length,
            };
          }

          return { finalized: false, reason: "No sessionId" };

        case "calculate-mos":
          // Calculate overall MOS statistics for a language/model
          // This would aggregate all ratings for reporting
          console.log("Calculating MOS statistics...");

          return { calculated: true };

        case "aggregate-results":
          // Aggregate evaluation results for export/reporting
          console.log("Aggregating results...");

          return { aggregated: true };

        default:
          throw new Error(`Unknown evaluation job type: ${type}`);
      }
    },
    {
      connection: createConnection(),
      concurrency: 3,
    },
  );

  worker.on("completed", (job) => {
    console.log(`✅ Evaluation processed: ${job.data.type} (${job.id})`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Evaluation failed: ${job?.data.type} - ${err.message}`);
  });

  return worker;
}
