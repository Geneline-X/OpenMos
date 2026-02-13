import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only owner can view all users
    if (session.user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await db
      .select({
        id: adminUsers.id,
        username: adminUsers.username,
        email: adminUsers.email,
        fullName: adminUsers.fullName,
        role: adminUsers.role,
        isActive: adminUsers.isActive,
        lastLogin: adminUsers.lastLogin,
        createdAt: adminUsers.createdAt,
      })
      .from(adminUsers)
      .orderBy(adminUsers.createdAt);

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        lastLogin: u.lastLogin?.toISOString() || null,
        createdAt: u.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
