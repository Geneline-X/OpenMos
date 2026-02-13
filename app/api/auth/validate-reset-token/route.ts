import { NextResponse } from "next/server";
import { eq, and, gt, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminUsers, passwordResetTokens } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required" },
        { status: 400 },
      );
    }

    // Find valid token
    const [resetToken] = await db
      .select({
        id: passwordResetTokens.id,
        adminId: passwordResetTokens.adminId,
        expiresAt: passwordResetTokens.expiresAt,
        usedAt: passwordResetTokens.usedAt,
        email: adminUsers.email,
      })
      .from(passwordResetTokens)
      .innerJoin(adminUsers, eq(passwordResetTokens.adminId, adminUsers.id))
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, new Date()),
          isNull(passwordResetTokens.usedAt),
        ),
      )
      .limit(1);

    if (!resetToken) {
      return NextResponse.json({
        valid: false,
        error: "Invalid or expired token",
      });
    }

    return NextResponse.json({
      valid: true,
      email: resetToken.email,
    });
  } catch (error) {
    console.error("Error validating reset token:", error);

    return NextResponse.json(
      { valid: false, error: "Failed to validate token" },
      { status: 500 },
    );
  }
}
