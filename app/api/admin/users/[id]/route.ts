import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUsers, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only owner can update users
    if (session.user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { isActive, role } = await request.json();

    // Cannot modify owner
    const [targetUser] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.role === "owner") {
      return NextResponse.json(
        { error: "Cannot modify owner account" },
        { status: 400 }
      );
    }

    // Prepare updates
    const updates: Record<string, unknown> = {};
    if (typeof isActive === "boolean") updates.isActive = isActive;
    if (role && ["admin", "researcher", "viewer"].includes(role)) {
      updates.role = role;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates" }, { status: 400 });
    }

    // Update user
    const [updatedUser] = await db
      .update(adminUsers)
      .set(updates)
      .where(eq(adminUsers.id, id))
      .returning();

    // Log the change
    await db.insert(auditLogs).values({
      adminId: session.user.id,
      action: "update_user",
      resourceType: "admin_user",
      resourceId: id,
      metadata: { updates },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
