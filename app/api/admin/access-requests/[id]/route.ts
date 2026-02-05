import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { accessRequests, adminInvitations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateResetToken } from "@/lib/auth/utils";

// PATCH - Approve or reject a request
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and owners can review requests
    if (!["admin", "owner"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { action, role, notes } = await request.json();

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Get the request
    const [accessRequest] = await db
      .select()
      .from(accessRequests)
      .where(eq(accessRequests.id, id))
      .limit(1);

    if (!accessRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (accessRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Request has already been reviewed" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Create an invitation for the approved user
      const inviteRole = role || "researcher";
      const token = generateResetToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days to accept

      await db.insert(adminInvitations).values({
        email: accessRequest.email,
        invitedBy: session.user.id,
        role: inviteRole,
        token,
        expiresAt,
      });

      // Update the request status
      await db
        .update(accessRequests)
        .set({
          status: "approved",
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          reviewNotes: notes || null,
        })
        .where(eq(accessRequests.id, id));

      // TODO: Send invitation email via queue
      const inviteUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/admin/accept-invite?token=${token}`;
      console.log(`Invitation created for ${accessRequest.email}: ${inviteUrl}`);

      return NextResponse.json({
        success: true,
        message: "Request approved and invitation sent",
        inviteUrl, // Remove in production
      });
    } else {
      // Reject the request
      await db
        .update(accessRequests)
        .set({
          status: "rejected",
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          reviewNotes: notes || null,
        })
        .where(eq(accessRequests.id, id));

      // TODO: Send rejection email via queue (optional)

      return NextResponse.json({
        success: true,
        message: "Request rejected",
      });
    }
  } catch (error) {
    console.error("Error reviewing access request:", error);
    return NextResponse.json(
      { error: "Failed to review request" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a request
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["admin", "owner"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    await db.delete(accessRequests).where(eq(accessRequests.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting access request:", error);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
