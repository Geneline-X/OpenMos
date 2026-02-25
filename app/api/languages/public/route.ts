import { NextResponse } from "next/server";
import { isNull, eq, and, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { languages } from "@/lib/db/schema";

/**
 * GET /api/languages/public
 *
 * Returns all globally active languages from the database.
 * Used by the public evaluation onboarding page to populate
 * the native language dropdown without requiring authentication.
 * Deduplication is done by name (case-insensitive).
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
      .where(and(eq(languages.isActive, true), or(isNull(languages.userId))))
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
      { status: 500 }
    );
  }
}
