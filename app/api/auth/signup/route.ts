import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  adminUsers,
  emailVerificationTokens,
  auditLogs,
} from "@/lib/db/schema";
import {
  hashPassword,
  validatePassword,
  generateResetToken,
  getResetTokenExpiry,
} from "@/lib/auth/utils";
import { initializeUserPreferences } from "@/app/actions/user-preferences";

export async function POST(request: Request) {
  try {
    console.time("signup parsing");
    const { name, email, username, password } = await request.json();

    console.timeEnd("signup parsing");

    if (!name || !email || !username || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    // Validate username format
    if (!/^[a-z0-9_-]{3,20}$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3-20 characters and contain only lowercase letters, numbers, hyphens, and underscores",
        },
        { status: 400 },
      );
    }

    // Validate password strength
    const validation = validatePassword(password, username, email);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors[0] },
        { status: 400 },
      );
    }

    // Check if email already exists
    console.time("DB user check");
    const [existingEmailUser] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email.toLowerCase()))
      .limit(1);

    if (existingEmailUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 },
      );
    }

    // Check if username already exists
    const [existingUsernameUser] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username.toLowerCase()))
      .limit(1);

    if (existingUsernameUser) {
      return NextResponse.json(
        { error: "This username is already taken" },
        { status: 400 },
      );
    }
    console.timeEnd("DB user check");

    // Hash password
    console.time("password hash");
    const passwordHash = await hashPassword(password);

    console.timeEnd("password hash");

    // Create user with researcher role and unverified status
    console.time("DB user creation");
    const [newUser] = await db
      .insert(adminUsers)
      .values({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
        fullName: name,
        role: "researcher", // Default role for signups
        isActive: false, // Inactive until email is verified
        emailVerified: false,
      })
      .returning();

    // Initialize default user preferences (enable all models/languages)
    await initializeUserPreferences(newUser.id);
    console.timeEnd("DB user creation");

    // Generate verification token
    const verificationToken = generateResetToken();
    const expiresAt = getResetTokenExpiry(); // 1 hour expiry

    await db.insert(emailVerificationTokens).values({
      adminId: newUser.id,
      token: verificationToken,
      expiresAt,
    });

    // Send verification email via Resend
    console.time("send verification email");
    try {
      const { sendVerificationEmail } = await import("@/lib/email/resend");

      await sendVerificationEmail(
        newUser.email,
        newUser.fullName || "Researcher",
        verificationToken,
      );
    } catch (emailError: any) {
      console.error("Failed to send verification email:", emailError);

      // Rollback: Delete the user we just created
      // This will cascade delete the verification token and preferences due to foreign key constraints or manual cleanup if needed
      await db.delete(adminUsers).where(eq(adminUsers.id, newUser.id));

      return NextResponse.json(
        {
          error:
            "Failed to send verification email. Please try again with a valid email address.",
          details: emailError.message,
        },
        { status: 500 },
      );
    }
    console.timeEnd("send verification email");

    // Log the signup
    await db.insert(auditLogs).values({
      adminId: newUser.id,
      action: "create_user",
      resourceType: "admin_user",
      resourceId: newUser.id,
      metadata: {
        role: "researcher",
        source: "signup",
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Account created! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Error during signup:", error);

    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 },
    );
  }
}
