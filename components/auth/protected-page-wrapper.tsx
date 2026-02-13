"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Spinner } from "@heroui/spinner";

import { AuthModal } from "./auth-modal";

interface ProtectedPageWrapperProps {
  children: ReactNode;
  requiredRole?: "viewer" | "researcher" | "admin" | "owner";
}

type AuthState =
  | "loading"
  | "unauthenticated"
  | "authenticating"
  | "authenticated";

export function ProtectedPageWrapper({
  children,
  requiredRole = "viewer",
}: ProtectedPageWrapperProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [showContent, setShowContent] = useState(false);

  // Role hierarchy for permission checking
  const roleHierarchy = ["viewer", "researcher", "admin", "owner"];

  const hasRequiredRole = (userRole: string) => {
    const userLevel = roleHierarchy.indexOf(userRole);
    const requiredLevel = roleHierarchy.indexOf(requiredRole);

    return userLevel >= requiredLevel;
  };

  useEffect(() => {
    if (status === "loading") {
      setAuthState("loading");
    } else if (status === "unauthenticated") {
      setAuthState("unauthenticated");
      setShowContent(false);
    } else if (status === "authenticated" && session?.user) {
      // Check role permission
      if (hasRequiredRole(session.user.role)) {
        setAuthState("authenticated");
        // Delay showing content for smooth transition
        setTimeout(() => setShowContent(true), 300);
      } else {
        // User doesn't have required role - show access denied
        setAuthState("authenticated");
        setShowContent(true);
      }
    }
  }, [status, session]);

  const handleAuthSuccess = () => {
    setAuthState("authenticating");
    // Show loading screen, then reveal content
    setTimeout(() => {
      setAuthState("authenticated");
      setTimeout(() => setShowContent(true), 300);
      router.refresh();
    }, 1500);
  };

  // Initial loading state
  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <Spinner color="primary" size="lg" />
          <p className="text-default-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Authenticating state (after successful login, before reveal)
  if (authState === "authenticating") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="p-4 rounded-full bg-success/10 animate-pulse">
              <Icon
                className="w-16 h-16 text-success"
                icon="solar:check-circle-bold-duotone"
              />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-success">
              Welcome back!
            </h2>
            <p className="text-default-500 mt-1">Preparing your dashboard...</p>
          </div>
          <Spinner color="success" size="sm" />
        </div>
      </div>
    );
  }

  // Check if authenticated but lacks required role
  if (
    authState === "authenticated" &&
    session?.user &&
    !hasRequiredRole(session.user.role)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-md w-full bg-content1 rounded-2xl shadow-xl p-8 text-center">
          <div className="p-4 rounded-full bg-danger/10 w-fit mx-auto mb-4">
            <Icon
              className="w-12 h-12 text-danger"
              icon="solar:shield-warning-bold-duotone"
            />
          </div>
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-default-500 mt-2">
            You don&apos;t have permission to access this page.
          </p>
          <div className="mt-4 p-3 rounded-lg bg-default-100">
            <p className="text-sm text-default-600">
              Your role:{" "}
              <strong className="capitalize">{session.user.role}</strong>
            </p>
            <p className="text-sm text-default-600">
              Required: <strong className="capitalize">{requiredRole}</strong>{" "}
              or higher
            </p>
          </div>
          <p className="text-sm text-default-400 mt-4">
            Contact your team owner to request elevated permissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Page content with blur effect when not authenticated */}
      <div
        className={`transition-all duration-500 ease-out ${
          showContent
            ? "filter-none opacity-100"
            : "filter blur-md opacity-50 pointer-events-none"
        }`}
      >
        {children}
      </div>

      {/* Auth Modal - shows when unauthenticated */}
      <AuthModal
        callbackUrl={pathname}
        isOpen={authState === "unauthenticated"}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
