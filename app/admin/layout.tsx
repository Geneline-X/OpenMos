"use client";

import type { ReactNode } from "react";

import { usePathname } from "next/navigation";

import { ProtectedPageWrapper } from "@/components/auth";
import { DashboardLayout } from "@/components/admin/dashboard-layout";

/**
 * Admin Layout
 *
 * Wraps all admin routes with authentication protection and dashboard layout.
 * This provides the sidebar, top navbar, and main content area.
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
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedPageWrapper>
  );
}
