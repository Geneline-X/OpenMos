import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

// GET /api/admin/profile - Get current user's profile
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db
      .select({
        id: adminUsers.id,
        username: adminUsers.username,
        email: adminUsers.email,
        fullName: adminUsers.fullName,
        role: adminUsers.role,
        createdAt: adminUsers.createdAt,
        lastLogin: adminUsers.lastLogin,
      })
      .from(adminUsers)
      .where(eq(adminUsers.id, session.user.id))
      .limit(1);

    if (!user[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user[0]);
  } catch (error) {
    console.error("Error fetching profile:", error);

    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/profile - Update user's profile (name only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName } = body;

    // Validation
    if (!fullName || typeof fullName !== "string") {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 },
      );
    }

    const trimmedName = fullName.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return NextResponse.json(
        { error: "Name must be between 2 and 100 characters" },
        { status: 400 },
      );
    }

    // Update user
    const updated = await db
      .update(adminUsers)
      .set({ fullName: trimmedName })
      .where(eq(adminUsers.id, session.user.id))
      .returning({
        id: adminUsers.id,
        username: adminUsers.username,
        email: adminUsers.email,
        fullName: adminUsers.fullName,
        role: adminUsers.role,
      });

    if (!updated[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updated[0],
    });
  } catch (error) {
    console.error("Error updating profile:", error);

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
