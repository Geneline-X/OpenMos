"use client";

import type { ReactNode } from "react";

import { usePathname } from "next/navigation";

import { ProtectedPageWrapper } from "@/components/auth";
import { DashboardLayout } from "@/components/admin/dashboard-layout";
import { StudyGuard } from "@/components/admin/study-guard";

/**
 * Admin Layout
 *
 * Wraps all admin routes with authentication protection and dashboard layout.
 * Data-dependent pages are gated behind an active study via StudyGuard.
 * Setup pages (Studies, Settings, Help, Profile) remain always accessible.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Public admin routes that don't require authentication or the dashboard layout
  const isPublicRoute =
    pathname?.startsWith("/admin/reset-password") ||
    pathname?.startsWith("/admin/accept-invite");

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <ProtectedPageWrapper requiredRole="viewer">
      <DashboardLayout>
        <StudyGuard>{children}</StudyGuard>
      </DashboardLayout>
    </ProtectedPageWrapper>
  );
}
