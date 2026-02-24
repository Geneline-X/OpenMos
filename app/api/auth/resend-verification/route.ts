import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminUsers, emailVerificationTokens } from "@/lib/db/schema";
import { generateResetToken, getResetTokenExpiry } from "@/lib/auth/utils";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find the user by email
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      // Don't reveal whether user exists for security
      return NextResponse.json({
        success: true,
        message: "Verification link sent if account exists",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "This email is already verified" },
        { status: 400 },
      );
    }

    // Process old tokens
    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.adminId, user.id));

    // Generate new token
    const verificationToken = generateResetToken();
    const expiresAt = getResetTokenExpiry(); // 1 hour expiry

    await db.insert(emailVerificationTokens).values({
      adminId: user.id,
      token: verificationToken,
      expiresAt,
    });

    // Send verification email via Resend
    try {
      const { sendVerificationEmail } = await import("@/lib/email/resend");

      await sendVerificationEmail(
        user.email,
        user.fullName || "Researcher",
        verificationToken,
      );
    } catch (emailError: any) {
      console.error("Failed to resend verification email:", emailError);

      return NextResponse.json(
        { error: "Failed to send verification email. Please try again later." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification link sent! Check your email.",
    });
  } catch (error) {
    console.error("Error in resend verification:", error);

    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 },
    );
  }
}
