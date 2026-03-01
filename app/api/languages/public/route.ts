import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { languages } from "@/lib/db/schema";

/**
 * GET /api/languages/public
 *
 * Returns ALL languages from the database for the public evaluation
 * onboarding page. Deduplication is done by name (case-insensitive).
 */
export async function GET() {
  try {
    const rows = await db
      .select({
        id: languages.id,
        name: languages.name,
        code: languages.code,
        flag: languages.flag,
        region: languages.region,
        speakers: languages.speakers,
      })
      .from(languages)
      .orderBy(languages.name);

    // Deduplicate by lowercase name — keep the first occurrence
    const seen = new Set<string>();
    const unique = rows.filter((lang) => {
      const key = lang.name.trim().toLowerCase();

      if (seen.has(key)) return false;
      seen.add(key);

      return true;
    });

    return NextResponse.json(unique);
  } catch (error) {
    console.error("Failed to fetch public languages:", error);

    return NextResponse.json(
      { error: "Failed to fetch languages" },
      { status: 500 },
    );
  }
}
