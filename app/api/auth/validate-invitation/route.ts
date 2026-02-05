import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminInvitations, adminUsers } from "@/lib/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required" },
        { status: 400 }
      );
    }

    // Find valid invitation
    const [invitation] = await db
      .select({
        id: adminInvitations.id,
        email: adminInvitations.email,
        role: adminInvitations.role,
        invitedBy: adminInvitations.invitedBy,
        expiresAt: adminInvitations.expiresAt,
        inviterName: adminUsers.fullName,
        inviterUsername: adminUsers.username,
      })
      .from(adminInvitations)
      .leftJoin(adminUsers, eq(adminInvitations.invitedBy, adminUsers.id))
      .where(
        and(
          eq(adminInvitations.token, token),
          gt(adminInvitations.expiresAt, new Date()),
          isNull(adminInvitations.acceptedAt),
          isNull(adminInvitations.revokedAt)
        )
      )
      .limit(1);

    if (!invitation) {
      return NextResponse.json({
        valid: false,
        error: "Invalid or expired invitation",
      });
    }

    return NextResponse.json({
      valid: true,
      email: invitation.email,
      role: invitation.role,
      inviterName: invitation.inviterName || invitation.inviterUsername || "Team Admin",
    });
  } catch (error) {
    console.error("Error validating invitation:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate invitation" },
      { status: 500 }
    );
  }
}
