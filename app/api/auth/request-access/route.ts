import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { accessRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { name, email, institution, reason } = await request.json();

    if (!name || !email || !institution || !reason) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if there's already a pending request from this email
    const existingRequest = await db
      .select()
      .from(accessRequests)
      .where(eq(accessRequests.email, email.toLowerCase()))
      .limit(1);

    if (existingRequest.length > 0) {
      const existing = existingRequest[0];
      if (existing.status === "pending") {
        return NextResponse.json({
          success: true,
          message: "You already have a pending request. We'll get back to you soon!",
        });
      }
      if (existing.status === "rejected") {
        // Allow resubmission if previously rejected
        await db.insert(accessRequests).values({
          name,
          email: email.toLowerCase(),
          institution,
          reason,
          status: "pending",
        });
        return NextResponse.json({
          success: true,
          message: "Request submitted successfully",
        });
      }
    }

    // Store the access request in the database
    const [newRequest] = await db.insert(accessRequests).values({
      name,
      email: email.toLowerCase(),
      institution,
      reason,
      status: "pending",
    }).returning();

    console.log("Access request stored:", newRequest.id);

    // TODO: Send email notification to admins via queue
    // await queueAccessRequestNotification(adminEmail, name, email, institution, reason);

    return NextResponse.json({
      success: true,
      message: "Request submitted successfully. We'll review it and get back to you.",
    });
  } catch (error) {
    console.error("Error processing access request:", error);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}
