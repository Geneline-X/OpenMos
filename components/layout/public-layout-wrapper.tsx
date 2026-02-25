"use client";

import { usePathname } from "next/navigation";
import { Link } from "@heroui/link";
import { Icon } from "@iconify/react";
import { ReactNode } from "react";

import { Navbar } from "@/components/navbar";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { siteConfig } from "@/config/site";

interface PublicLayoutWrapperProps {
  children: ReactNode;
}

/**
 * Public Layout Wrapper
 *
 * Conditionally renders the public site navbar and footer.
 * Admin routes get their own layout without these elements.
 */
export function PublicLayoutWrapper({ children }: PublicLayoutWrapperProps) {
  const pathname = usePathname();

  // Check if we're on an admin route or evaluate route
  const isAdminRoute = pathname?.startsWith("/admin");
  const isEvaluateRoute =
    pathname?.startsWith("/evaluate") || pathname?.startsWith("/start");

  // Admin and evaluate routes get a clean layout without public navbar/footer
  if (isAdminRoute || isEvaluateRoute) {
    return <>{children}</>;
  }

  // Public routes get the full layout with navbar and footer
  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main
        className={
          pathname === "/"
            ? "flex-grow"
            : "container mx-auto max-w-4xl pt-16 px-4 md:px-6 flex-grow pb-24"
        }
      >
        {children}
      </main>
      <footer className="w-full border-t border-default-200 py-6 no-print">
        <div className="container mx-auto max-w-4xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center md:items-start gap-1 text-default-500 text-sm">
              <div className="flex items-center gap-2">
                <Icon
                  className="w-5 h-5 text-primary"
                  icon="solar:soundwave-bold-duotone"
                />
                <span className="font-semibold">OpenMOS Research Platform</span>
              </div>
              <span className="text-xs mt-1 text-center md:text-left">
                For support or contact:{" "}
                <Link
                  className="text-xs text-primary"
                  href="mailto:info@geneline-x.net"
                >
                  info@geneline-x.net
                </Link>
              </span>
              <span className="text-xs text-center md:text-left">
                Powered by{" "}
                <Link
                  isExternal
                  className="text-xs text-primary font-semibold"
                  href="https://geneline-x.net/"
                >
                  Geneline
                </Link>
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link
                className="text-default-500 hover:text-primary flex items-center gap-1"
                href="/about"
              >
                <Icon className="w-4 h-4" icon="solar:info-circle-linear" />
                About
              </Link>
              <Link
                className="text-default-500 hover:text-primary flex items-center gap-1"
                href="/privacy"
              >
                <Icon className="w-4 h-4" icon="solar:shield-check-linear" />
                Privacy
              </Link>
              <Link
                isExternal
                className="text-default-500 hover:text-primary flex items-center gap-1"
                href={siteConfig.links.github}
              >
                <Icon className="w-4 h-4" icon="solar:code-linear" />
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>
      <CookieConsentBanner />
    </div>
  );
}
