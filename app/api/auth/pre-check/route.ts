import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { verifyPassword, isAccountLocked } from "@/lib/auth/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { usernameOrEmail, password } = body;

    if (!usernameOrEmail || !password) {
      return NextResponse.json({ error: "credentials" });
    }

    const [user] = await db
      .select()
      .from(adminUsers)
      .where(
        or(
          eq(adminUsers.username, usernameOrEmail.toLowerCase()),
          eq(adminUsers.email, usernameOrEmail.toLowerCase()),
        ),
      )
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "credentials" });
    }

    // Must verify password to prevent username enumeration
    if (!user.passwordHash) {
      return NextResponse.json({ error: "oauth" });
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: "credentials" });
    }

    // Now check states securely since we know the user possesses the password
    if (!user.emailVerified) {
      return NextResponse.json({ error: "unverified-email" });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "deactivated" });
    }

    if (isAccountLocked(user.lockedUntil)) {
      return NextResponse.json({ error: "account-locked" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pre-check error:", error);

    return NextResponse.json({ error: "server-error" });
  }
}
