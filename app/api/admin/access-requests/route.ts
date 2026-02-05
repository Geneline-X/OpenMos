import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { accessRequests } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

// GET - List all access requests
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // pending, approved, rejected

    let requests;
    
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      requests = await db
        .select()
        .from(accessRequests)
        .where(eq(accessRequests.status, status as "pending" | "approved" | "rejected"))
        .orderBy(desc(accessRequests.createdAt));
    } else {
      requests = await db
        .select()
        .from(accessRequests)
        .orderBy(desc(accessRequests.createdAt));
    }

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching access requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}
