import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUsers, passwordResetTokens, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateResetToken, getResetTokenExpiry } from "@/lib/auth/utils";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email.toLowerCase()))
      .limit(1);

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, a reset email will be sent",
      });
    }

    // Check if user has password (not OAuth-only)
    if (!user.passwordHash && user.oauthProvider) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, a reset email will be sent",
      });
    }

    // Generate reset token
    const token = generateResetToken();
    const expiresAt = getResetTokenExpiry();

    // Store token in database
    await db.insert(passwordResetTokens).values({
      adminId: user.id,
      token,
      expiresAt,
    });

    // Log the request
    await db.insert(auditLogs).values({
      adminId: user.id,
      action: "password_reset_request",
      metadata: { email: user.email },
    });

    // TODO: Send email with reset link
    // For now, log the token (in production, use a proper email service)
    console.log(`Password reset link: /admin/reset-password?token=${token}`);
    console.log(`For user: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: "If an account exists, a reset email will be sent",
      // Include token in development only
      ...(process.env.NODE_ENV === "development" && { token }),
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
