import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminInvitations } from "@/lib/db/schema";
import { generateInviteToken, getInviteTokenExpiry } from "@/lib/auth/utils";

// POST - Resend invitation
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate new token and extend expiry
    const newToken = generateInviteToken();
    const newExpiry = getInviteTokenExpiry();

    const [updatedInvite] = await db
      .update(adminInvitations)
      .set({
        token: newToken,
        expiresAt: newExpiry,
      })
      .where(eq(adminInvitations.id, id))
      .returning();

    if (!updatedInvite) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 },
      );
    }

    // TODO: Send invitation email
    console.log(`New invitation link: /admin/accept-invite?token=${newToken}`);
    console.log(`For: ${updatedInvite.email}`);

    return NextResponse.json({
      success: true,
      // Include token in development only
      ...(process.env.NODE_ENV === "development" && { token: newToken }),
    });
  } catch (error) {
    console.error("Error resending invitation:", error);

    return NextResponse.json(
      { error: "Failed to resend invitation" },
      { status: 500 },
    );
  }
}
