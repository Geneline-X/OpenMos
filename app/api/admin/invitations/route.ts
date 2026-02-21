import type { AdminRole } from "@/lib/db/schema";

import { NextResponse } from "next/server";
import { eq, isNull, gt, and } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminInvitations, adminUsers, auditLogs } from "@/lib/db/schema";
import { generateInviteToken, getInviteTokenExpiry } from "@/lib/auth/utils";
import { queueInvitationEmail } from "@/lib/queue/jobs";

// GET - List pending invitations
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invitations = await db
      .select({
        id: adminInvitations.id,
        email: adminInvitations.email,
        role: adminInvitations.role,
        createdAt: adminInvitations.createdAt,
        expiresAt: adminInvitations.expiresAt,
      })
      .from(adminInvitations)
      .where(
        and(
          isNull(adminInvitations.acceptedAt),
          isNull(adminInvitations.revokedAt),
          gt(adminInvitations.expiresAt, new Date()),
        ),
      )
      .orderBy(adminInvitations.createdAt);

    return NextResponse.json({
      invitations: invitations.map((inv) => ({
        ...inv,
        createdAt: inv.createdAt.toISOString(),
        expiresAt: inv.expiresAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching invitations:", error);

    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 },
    );
  }
}

// POST - Create new invitation
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 },
      );
    }

    if (!["admin", "researcher", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if email already exists as user
    const [existingUser] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 },
      );
    }

    // Check for existing pending invitation
    const [existingInvite] = await db
      .select()
      .from(adminInvitations)
      .where(
        and(
          eq(adminInvitations.email, email.toLowerCase()),
          isNull(adminInvitations.acceptedAt),
          isNull(adminInvitations.revokedAt),
          gt(adminInvitations.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (existingInvite) {
      return NextResponse.json(
        { error: "A pending invitation already exists for this email" },
        { status: 400 },
      );
    }

    // Create invitation
    const token = generateInviteToken();
    const expiresAt = getInviteTokenExpiry();

    const [invitation] = await db
      .insert(adminInvitations)
      .values({
        email: email.toLowerCase(),
        role: role as AdminRole,
        token,
        expiresAt,
        invitedBy: session.user.id,
      })
      .returning();

    // Log the invitation
    await db.insert(auditLogs).values({
      adminId: session.user.id,
      action: "create_user",
      resourceType: "admin_invitation",
      resourceId: invitation.id,
      metadata: { email, role },
    });

    // Send invitation email
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/accept-invite?token=${token}`;

    await queueInvitationEmail(
      email,
      "Colleague", // Default inviteeName since it's not provided in the request
      inviteUrl,
      session.user.fullName || session.user.username || "Admin",
      role,
    );

    console.log(`Invitation link: ${inviteUrl}`);
    console.log(`For: ${email}`);

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        createdAt: invitation.createdAt.toISOString(),
        expiresAt: invitation.expiresAt.toISOString(),
      },
      // Include token in development only
      ...(process.env.NODE_ENV === "development" && { token }),
    });
  } catch (error) {
    console.error("Error creating invitation:", error);

    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 },
    );
  }
}
