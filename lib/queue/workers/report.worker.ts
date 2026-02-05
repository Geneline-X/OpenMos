import { Worker, Job } from "bullmq";
import { createConnection } from "../connection";
import { db } from "@/lib/db";
import { ratings, evaluationSessions, audioSamples } from "@/lib/db/schema";
import { eq, sql, gte, lte, and } from "drizzle-orm";
import type { ReportJobData } from "../types";

export function createReportWorker() {
  const worker = new Worker<ReportJobData>(
    "report",
    async (job: Job<ReportJobData>) => {
      const { type, requestedBy, filters, format = "json" } = job.data;
      
      console.log(`📊 Processing report job: ${type}`);
      
      switch (type) {
        case "export-evaluations": {
          // Build query with filters
          const conditions = [];
          if (filters?.startDate) {
            conditions.push(gte(ratings.timestamp, filters.startDate));
          }
          if (filters?.endDate) {
            conditions.push(lte(ratings.timestamp, filters.endDate));
          }

          // Fetch evaluation data
          const data = await db
            .select({
              ratingId: ratings.id,
              sessionId: ratings.sessionId,
              audioId: ratings.audioId,
              score: ratings.score,
              timeToRateMs: ratings.timeToRateMs,
              timestamp: ratings.timestamp,
              sampleFileUrl: audioSamples.fileUrl,
              sampleLanguage: audioSamples.language,
              sampleModelType: audioSamples.modelType,
            })
            .from(ratings)
            .leftJoin(audioSamples, eq(ratings.audioId, audioSamples.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .limit(10000);

          // Format based on requested format
          let output: string;
          if (format === "csv") {
            const headers = Object.keys(data[0] || {}).join(",");
            const rows = data.map((row) => Object.values(row).join(","));
            output = [headers, ...rows].join("\n");
          } else {
            output = JSON.stringify(data, null, 2);
          }

          // TODO: Save to file storage and notify user
          console.log(`Generated ${format.toUpperCase()} export with ${data.length} rows`);
          
          return { 
            generated: true, 
            rowCount: data.length, 
            format,
            // In production: return file URL
          };
        }

        case "generate-statistics": {
          // Calculate overall statistics
          const stats = await db
            .select({
              totalRatings: sql<number>`COUNT(*)`,
              avgScore: sql<number>`AVG(${ratings.score})::decimal(3,2)`,
              totalSessions: sql<number>`COUNT(DISTINCT ${ratings.sessionId})`,
            })
            .from(ratings);

          const languageStats = await db
            .select({
              language: audioSamples.language,
              avgScore: sql<number>`AVG(${ratings.score})::decimal(3,2)`,
              count: sql<number>`COUNT(*)`,
            })
            .from(ratings)
            .leftJoin(audioSamples, eq(ratings.audioId, audioSamples.id))
            .groupBy(audioSamples.language);

          const modelStats = await db
            .select({
              modelType: audioSamples.modelType,
              avgScore: sql<number>`AVG(${ratings.score})::decimal(3,2)`,
              count: sql<number>`COUNT(*)`,
            })
            .from(ratings)
            .leftJoin(audioSamples, eq(ratings.audioId, audioSamples.id))
            .groupBy(audioSamples.modelType);

          return {
            generated: true,
            statistics: {
              overall: stats[0],
              byLanguage: languageStats,
              byModel: modelStats,
            },
          };
        }

        case "sample-analysis": {
          // Analyze individual sample performance
          const sampleStats = await db
            .select({
              audioId: ratings.audioId,
              fileUrl: audioSamples.fileUrl,
              language: audioSamples.language,
              modelType: audioSamples.modelType,
              avgScore: sql<number>`AVG(${ratings.score})::decimal(3,2)`,
              stdDev: sql<number>`STDDEV(${ratings.score})::decimal(3,2)`,
              ratingCount: sql<number>`COUNT(*)`,
            })
            .from(ratings)
            .leftJoin(audioSamples, eq(ratings.audioId, audioSamples.id))
            .groupBy(ratings.audioId, audioSamples.fileUrl, audioSamples.language, audioSamples.modelType)
            .orderBy(sql`AVG(${ratings.score}) DESC`);

          return { generated: true, samples: sampleStats };
        }

        case "user-activity": {
          // Evaluation sessions activity report
          const activity = await db
            .select({
              sessionId: evaluationSessions.id,
              completedCount: evaluationSessions.completedCount,
              startedAt: evaluationSessions.startedAt,
              completedAt: evaluationSessions.completedAt,
            })
            .from(evaluationSessions)
            .limit(100);

          return { generated: true, activity };
        }

        default:
          throw new Error(`Unknown report job type: ${type}`);
      }
    },
    {
      connection: createConnection(),
      concurrency: 2, // Limit concurrent reports
    }
  );

  worker.on("completed", (job) => {
    console.log(`✅ Report generated: ${job.data.type} (${job.id})`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Report failed: ${job?.data.type} - ${err.message}`);
  });

  return worker;
}
