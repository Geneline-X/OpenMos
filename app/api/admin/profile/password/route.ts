import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUsers, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/auth/utils";
import { getClientIP } from "@/lib/auth/utils";

// POST /api/admin/profile/password - Change user's password
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { oldPassword, newPassword } = body;

        // Validation
        if (!oldPassword || !newPassword) {
            return NextResponse.json(
                { error: "Old password and new password are required" },
                { status: 400 }
            );
        }

        if (typeof oldPassword !== "string" || typeof newPassword !== "string") {
            return NextResponse.json(
                { error: "Invalid password format" },
                { status: 400 }
            );
        }

        // Get current user with password hash
        const user = await db
            .select({
                id: adminUsers.id,
                passwordHash: adminUsers.passwordHash,
                username: adminUsers.username,
                email: adminUsers.email,
            })
            .from(adminUsers)
            .where(eq(adminUsers.id, session.user.id))
            .limit(1);

        if (!user[0]) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user[0].passwordHash) {
            return NextResponse.json(
                { error: "Password change not available for OAuth accounts" },
                { status: 400 }
            );
        }

        // Verify old password
        const isValidOldPassword = await verifyPassword(
            oldPassword,
            user[0].passwordHash
        );

        if (!isValidOldPassword) {
            return NextResponse.json(
                { error: "Current password is incorrect" },
                { status: 400 }
            );
        }

        // Check if new password is different
        if (oldPassword === newPassword) {
            return NextResponse.json(
                { error: "New password must be different from current password" },
                { status: 400 }
            );
        }

        // Validate new password strength
        if (newPassword.length < 12) {
            return NextResponse.json(
                { error: "Password must be at least 12 characters" },
                { status: 400 }
            );
        }

        if (!/[A-Z]/.test(newPassword)) {
            return NextResponse.json(
                { error: "Password must contain at least one uppercase letter" },
                { status: 400 }
            );
        }

        if (!/[a-z]/.test(newPassword)) {
            return NextResponse.json(
                { error: "Password must contain at least one lowercase letter" },
                { status: 400 }
            );
        }

        if (!/\d/.test(newPassword)) {
            return NextResponse.json(
                { error: "Password must contain at least one number" },
                { status: 400 }
            );
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
            return NextResponse.json(
                { error: "Password must contain at least one special character" },
                { status: 400 }
            );
        }

        // Check if password contains username or email
        if (
            newPassword.toLowerCase().includes(user[0].username.toLowerCase()) ||
            newPassword.toLowerCase().includes(user[0].email.split("@")[0].toLowerCase())
        ) {
            return NextResponse.json(
                { error: "Password cannot contain your username or email" },
                { status: 400 }
            );
        }

        // Hash new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update password
        await db
            .update(adminUsers)
            .set({ passwordHash: newPasswordHash })
            .where(eq(adminUsers.id, session.user.id));

        // Create audit log
        await db.insert(auditLogs).values({
            adminId: session.user.id,
            action: "password_reset_complete",
            ipAddress: getClientIP(request),
            userAgent: request.headers.get("user-agent") || undefined,
            metadata: { method: "profile_page" },
        });

        return NextResponse.json({
            message: "Password changed successfully",
        });
    } catch (error) {
        console.error("Error changing password:", error);
        return NextResponse.json(
            { error: "Failed to change password" },
            { status: 500 }
        );
    }
}
