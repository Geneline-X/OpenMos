import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ratings, raters, audioSamples, evaluationSessions } from "@/lib/db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";

interface ExportFilters {
  language?: string;
  modelType?: string;
  startDate?: string;
  endDate?: string;
}

async function getRatingsData(filters: ExportFilters) {
  // Build the query with joins
  const conditions = [];

  if (filters.language) {
    conditions.push(eq(audioSamples.language, filters.language));
  }
  if (filters.modelType) {
    conditions.push(eq(audioSamples.modelType, filters.modelType));
  }
  if (filters.startDate) {
    conditions.push(gte(ratings.timestamp, new Date(filters.startDate)));
  }
  if (filters.endDate) {
    conditions.push(lte(ratings.timestamp, new Date(filters.endDate)));
  }

  const data = await db
    .select({
      audio_id: ratings.audioId,
      model_type: audioSamples.modelType,
      score: ratings.score,
      rater_id: ratings.raterId,
      timestamp: ratings.timestamp,
      language: audioSamples.language,
      age: raters.age,
      gender: raters.gender,
      playback_count: ratings.playbackCount,
      time_to_rate_ms: ratings.timeToRateMs,
      session_id: ratings.sessionId,
    })
    .from(ratings)
    .innerJoin(audioSamples, eq(ratings.audioId, audioSamples.id))
    .innerJoin(raters, eq(ratings.raterId, raters.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(ratings.timestamp);

  return data;
}

function generateCSV(data: any[]) {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return "";
        if (value instanceof Date) return value.toISOString();
        if (typeof value === "string" && value.includes(",")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      })
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

function generateJSON(data: any[]) {
  return JSON.stringify(data, null, 2);
}

function generateLatexTable(data: any[]) {
  // Calculate statistics per model
  const modelStats: Record<string, { scores: number[]; n: number }> = {};

  data.forEach((row) => {
    const model = row.model_type;
    if (!modelStats[model]) {
      modelStats[model] = { scores: [], n: 0 };
    }
    modelStats[model].scores.push(row.score);
    modelStats[model].n++;
  });

  // Calculate MOS, SD, and 95% CI for each model
  const stats = Object.entries(modelStats).map(([model, { scores, n }]) => {
    const mean = scores.reduce((a, b) => a + b, 0) / n;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const marginOfError = 1.96 * (stdDev / Math.sqrt(n));
    const ciLower = mean - marginOfError;
    const ciUpper = mean + marginOfError;

    return {
      model,
      mean: mean.toFixed(2),
      stdDev: stdDev.toFixed(2),
      ci: `[${ciLower.toFixed(2)}, ${ciUpper.toFixed(2)}]`,
      n,
    };
  });

  // Generate LaTeX table
  const latex = `
\\begin{table}[h]
\\centering
\\caption{Mean Opinion Score (MOS) Results}
\\label{tab:mos-results}
\\begin{tabular}{lccccc}
\\hline
\\textbf{Model} & \\textbf{MOS} & \\textbf{Std Dev} & \\textbf{95\\% CI} & \\textbf{n} \\\\
\\hline
${stats.map((s) => `${s.model} & ${s.mean} & ${s.stdDev} & ${s.ci} & ${s.n} \\\\`).join("\n")}
\\hline
\\end{tabular}
\\end{table}
`.trim();

  return latex;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const language = searchParams.get("language") || undefined;
    const modelType = searchParams.get("modelType") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const data = await getRatingsData({ language, modelType, startDate, endDate });

    let content: string;
    let contentType: string;
    let filename: string;

    const timestamp = new Date().toISOString().split("T")[0];

    switch (format) {
      case "json":
        content = generateJSON(data);
        contentType = "application/json";
        filename = `mos-ratings-${timestamp}.json`;
        break;

      case "latex":
        content = generateLatexTable(data);
        contentType = "text/plain";
        filename = `mos-table-${timestamp}.tex`;
        break;

      case "csv":
      default:
        content = generateCSV(data);
        contentType = "text/csv";
        filename = `mos-ratings-${timestamp}.csv`;
        break;
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // For stats/summary endpoint
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { language, modelType, startDate, endDate } = body;

    const data = await getRatingsData({ language, modelType, startDate, endDate });

    // Calculate comprehensive statistics
    const modelStats: Record<string, { scores: number[]; n: number }> = {};

    data.forEach((row) => {
      const model = row.model_type;
      if (!modelStats[model]) {
        modelStats[model] = { scores: [], n: 0 };
      }
      modelStats[model].scores.push(row.score);
      modelStats[model].n++;
    });

    const stats = Object.entries(modelStats).map(([model, { scores, n }]) => {
      const mean = scores.reduce((a, b) => a + b, 0) / n;
      const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
      const stdDev = Math.sqrt(variance);
      const marginOfError = 1.96 * (stdDev / Math.sqrt(n));

      return {
        model,
        mean: parseFloat(mean.toFixed(2)),
        stdDev: parseFloat(stdDev.toFixed(2)),
        ciLower: parseFloat((mean - marginOfError).toFixed(2)),
        ciUpper: parseFloat((mean + marginOfError).toFixed(2)),
        n,
        min: Math.min(...scores),
        max: Math.max(...scores),
        distribution: [1, 2, 3, 4, 5].map(
          (score) => scores.filter((s) => s === score).length
        ),
      };
    });

    return NextResponse.json({
      totalRatings: data.length,
      uniqueRaters: new Set(data.map((d) => d.rater_id)).size,
      models: stats,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to get statistics" }, { status: 500 });
  }
}
