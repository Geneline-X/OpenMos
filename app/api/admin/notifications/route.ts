import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { desc, eq, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const unreadOnly = searchParams.get("unread") === "true";

    // Build query
    let query = db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    // Filter by unread if requested
    const notificationsList = unreadOnly
      ? await db
          .select()
          .from(notifications)
          .where(eq(notifications.isRead, false))
          .orderBy(desc(notifications.createdAt))
          .limit(limit)
      : await query;

    // Get unread count
    const [unreadResult] = await db
      .select({ count: count() })
      .from(notifications)
      .where(eq(notifications.isRead, false));

    return NextResponse.json({
      notifications: notificationsList.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        metadata: n.metadata,
        read: n.isRead,
        createdAt: n.createdAt,
        timeAgo: getTimeAgo(n.createdAt),
      })),
      unreadCount: unreadResult?.count || 0,
    });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, markAll } = body;

    if (markAll) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.isRead, false));
    } else if (ids && Array.isArray(ids)) {
      for (const id of ids) {
        await db
          .update(notifications)
          .set({ isRead: true })
          .where(eq(notifications.id, id));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notifications update error:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date | null): string {
  if (!date) return "Unknown";

  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}
