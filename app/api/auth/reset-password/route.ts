import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUsers, passwordResetTokens, auditLogs } from "@/lib/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { hashPassword, validatePassword } from "@/lib/auth/utils";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: "Token and password are required" },
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

    // Find valid token
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, new Date()),
          isNull(passwordResetTokens.usedAt)
        )
      )
      .limit(1);

    if (!resetToken) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user password
    await db
      .update(adminUsers)
      .set({
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      })
      .where(eq(adminUsers.id, resetToken.adminId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, resetToken.id));

    // Invalidate all other reset tokens for this user
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(passwordResetTokens.adminId, resetToken.adminId),
          isNull(passwordResetTokens.usedAt)
        )
      );

    // Log the password reset
    await db.insert(auditLogs).values({
      adminId: resetToken.adminId,
      action: "password_reset_complete",
    });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
