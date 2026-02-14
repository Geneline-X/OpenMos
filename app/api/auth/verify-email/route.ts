import { NextResponse } from "next/server";
import { eq, and, gt, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { emailVerificationTokens, adminUsers } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find valid verification token
    const [verificationToken] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, token),
          gt(emailVerificationTokens.expiresAt, new Date()),
          isNull(emailVerificationTokens.usedAt)
        )
      )
      .limit(1);

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Update user to mark email as verified and activate account
    const [updatedUser] = await db
      .update(adminUsers)
      .set({
        emailVerified: true,
        isActive: true, // Activate the account
      })
      .where(eq(adminUsers.id, verificationToken.adminId))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Mark token as used
    await db
      .update(emailVerificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(emailVerificationTokens.id, verificationToken.id));

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now sign in.",
    });
  } catch (error) {
    console.error("Error verifying email:", error);

    return NextResponse.json(
      { success: false, error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
