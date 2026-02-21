import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminUsers, passwordResetTokens, auditLogs } from "@/lib/db/schema";
import { generateResetToken, getResetTokenExpiry } from "@/lib/auth/utils";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 },
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

    // Send password reset email via Resend
    try {
      const { sendPasswordResetEmail } = await import("@/lib/email/resend");

      await sendPasswordResetEmail(user.email, user.fullName || "User", token);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Don't expose email sending failures to prevent enumeration
    }

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
      { status: 500 },
    );
  }
}
