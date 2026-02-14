import { NextResponse } from "next/server";
import { eq, and, gt, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminInvitations, adminUsers, auditLogs } from "@/lib/db/schema";
import { hashPassword, validatePassword } from "@/lib/auth/utils";
import { initializeUserPreferences } from "@/app/actions/user-preferences";

export async function POST(request: Request) {
  try {
    const { token, fullName, password } = await request.json();

    if (!token || !fullName || !password) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    const validation = validatePassword(password);

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors[0] },
        { status: 400 }
      );
    }

    // Find valid invitation
    const [invitation] = await db
      .select()
      .from(adminInvitations)
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
      return NextResponse.json(
        { success: false, error: "Invalid or expired invitation" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existingUser] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, invitation.email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate username from email
    const username = invitation.email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    // Create user
    const [newUser] = await db
      .insert(adminUsers)
      .values({
        username,
        email: invitation.email.toLowerCase(),
        passwordHash,
        fullName,
        role: invitation.role,
        isActive: true,
        emailVerified: true, // Verified via invitation
        createdBy: invitation.invitedBy,
      })
      .returning();

    // Initialize default user preferences
    await initializeUserPreferences(newUser.id);

    // Mark invitation as accepted
    await db
      .update(adminInvitations)
      .set({ acceptedAt: new Date() })
      .where(eq(adminInvitations.id, invitation.id));

    // Log the creation
    await db.insert(auditLogs).values({
      adminId: newUser.id,
      action: "create_user",
      resourceType: "admin_user",
      resourceId: newUser.id,
      metadata: {
        invitedBy: invitation.invitedBy,
        role: invitation.role,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create account" },
      { status: 500 }
    );
  }
}
