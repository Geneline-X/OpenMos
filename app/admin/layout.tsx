"use client";

import type { ReactNode } from "react";

import { ProtectedPageWrapper } from "@/components/auth";
import { DashboardLayout } from "@/components/admin/dashboard-layout";

/**
 * Admin Layout
 *
 * Wraps all admin routes with authentication protection and dashboard layout.
 * This provides the sidebar, top navbar, and main content area.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedPageWrapper requiredRole="viewer">
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedPageWrapper>
  );
}
