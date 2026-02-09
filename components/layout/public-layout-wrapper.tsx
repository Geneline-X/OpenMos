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
  const isEvaluateRoute = pathname?.startsWith("/evaluate") || pathname?.startsWith("/start");

  // Admin and evaluate routes get a clean layout without public navbar/footer
  if (isAdminRoute || isEvaluateRoute) {
    return <>{children}</>;
  }

  // Public routes get the full layout with navbar and footer
  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-4xl pt-16 px-4 md:px-6 flex-grow pb-24">
        {children}
      </main>
      <footer className="w-full border-t border-default-200 py-6 no-print">
        <div className="container mx-auto max-w-4xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-default-500 text-sm">
              <Icon icon="solar:soundwave-bold-duotone" className="w-5 h-5 text-primary" />
              <span>OpenMOS Research Platform</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/about" className="text-default-500 hover:text-primary flex items-center gap-1">
                <Icon icon="solar:info-circle-linear" className="w-4 h-4" />
                About
              </Link>
              <Link href="/privacy" className="text-default-500 hover:text-primary flex items-center gap-1">
                <Icon icon="solar:shield-check-linear" className="w-4 h-4" />
                Privacy
              </Link>
              <Link
                href={siteConfig.links.github}
                isExternal
                className="text-default-500 hover:text-primary flex items-center gap-1"
              >
                <Icon icon="solar:code-linear" className="w-4 h-4" />
                GitHub
              </Link>
              <Link
                href="/admin"
                className="text-default-400 hover:text-primary flex items-center gap-1 text-xs"
              >
                <Icon icon="solar:user-id-linear" className="w-3 h-3" />
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
      <CookieConsentBanner />
    </div>
  );
}
