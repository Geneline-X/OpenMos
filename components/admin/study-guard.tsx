"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Spinner } from "@heroui/spinner";

import { checkActiveStudy } from "@/app/actions/active-study";

interface StudyGuardProps {
  children: ReactNode;
}

/**
 * Routes that bypass the study guard — always accessible
 * even without an active study (setup & config pages).
 */
const BYPASS_PREFIXES = [
  "/admin/studies",
  "/admin/settings",
  "/admin/help",
  "/admin/profile",
  "/admin/accept-invite",
  "/admin/reset-password",
];

/**
 * StudyGuard
 *
 * Wraps admin dashboard pages and blocks access to data-dependent pages
 * (Dashboard, Analytics, Samples, Raters, Ratings, Export, Upload)
 * when the current user has no active study.
 *
 * Setup pages (Studies, Settings, Help, Profile) always render normally.
 */
export function StudyGuard({ children }: StudyGuardProps) {
  const pathname = usePathname();
  const [hasActiveStudy, setHasActiveStudy] = useState<boolean | null>(null);

  // Check if current route should bypass the guard

  const shouldBypass = BYPASS_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix),
  );

  useEffect(() => {
    // Skip check for bypass routes
    if (shouldBypass) {
      setHasActiveStudy(true); // Don't block

      return;
    }

    let cancelled = false;

    async function check() {
      try {
        const result = await checkActiveStudy();

        if (!cancelled) {
          setHasActiveStudy(result.hasActiveStudy);
        }
      } catch {
        // On error, don't block — let the page render
        if (!cancelled) {
          setHasActiveStudy(true);
        }
      }
    }

    check();

    return () => {
      cancelled = true;
    };
  }, [pathname, shouldBypass]);

  // Bypass routes always render immediately
  if (shouldBypass) {
    return <>{children}</>;
  }

  // Loading state
  if (hasActiveStudy === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // No active study → show setup prompt
  if (!hasActiveStudy) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-lg w-full border border-default-200" shadow="sm">
          <CardBody className="items-center text-center gap-6 p-10">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Icon
                className="w-10 h-10 text-primary"
                icon="solar:clipboard-text-bold-duotone"
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Study Required
              </h2>
              <p className="text-default-500 leading-relaxed max-w-sm">
                Set up your models and languages first, then create and activate
                a study to unlock the dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button
                as={Link}
                className="font-semibold"
                color="primary"
                href="/admin/settings"
                size="lg"
                startContent={
                  <Icon
                    className="w-5 h-5"
                    icon="solar:settings-bold-duotone"
                  />
                }
              >
                Configure Models & Languages
              </Button>
              <Button
                as={Link}
                className="font-semibold"
                href="/admin/studies"
                size="lg"
                startContent={
                  <Icon
                    className="w-5 h-5"
                    icon="solar:add-circle-bold-duotone"
                  />
                }
                variant="flat"
              >
                Create a Study
              </Button>
            </div>

            <p className="text-xs text-default-400 mt-2">
              Settings → add models &amp; languages → Studies → create &amp;
              activate a study.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Active study exists → render page normally
  return <>{children}</>;
}
