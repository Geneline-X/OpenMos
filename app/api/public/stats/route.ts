import { NextResponse } from "next/server";
import { count } from "drizzle-orm";

import { db } from "@/lib/db";
import { raters } from "@/lib/db/schema";

export async function GET() {
  try {
    // Get total number of unique raters who have completed evaluations
    const [result] = await db.select({ count: count() }).from(raters);

    return NextResponse.json({
      totalRaters: result?.count || 0,
    });
  } catch (error) {
    console.error("Public stats error:", error);

    return NextResponse.json({ totalRaters: 0 });
  }
}
