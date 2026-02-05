"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@heroui/theme";

import { useSidebar } from "./sidebar-context";
import { navigationIcons } from "./icons";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badgeKey?: "samples" | "activeRaters" | "ratings";
  badgeColor?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

interface BadgeCounts {
  samples: number;
  activeRaters: number;
  ratings: number;
}

const mainNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: navigationIcons.dashboard,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: navigationIcons.analytics,
  },
  {
    label: "Audio Samples",
    href: "/admin/samples",
    icon: navigationIcons.samples,
    badgeKey: "samples",
    badgeColor: "default",
  },
  {
    label: "Raters",
    href: "/admin/raters",
    icon: navigationIcons.raters,
    badgeKey: "activeRaters",
    badgeColor: "success",
  },
  {
    label: "Ratings",
    href: "/admin/ratings",
    icon: navigationIcons.ratings,
    badgeKey: "ratings",
    badgeColor: "primary",
  },
  {
    label: "Export Center",
    href: "/admin/export",
    icon: navigationIcons.export,
  },
];

const studyNavItems: NavItem[] = [
  {
    label: "Current Study",
    href: "/admin/studies/current",
    icon: navigationIcons.currentStudy,
  },
  {
    label: "Past Studies",
    href: "/admin/studies",
    icon: navigationIcons.pastStudies,
  },
];

const secondaryNavItems: NavItem[] = [
  {
    label: "Settings",
    href: "/admin/settings",
    icon: navigationIcons.settings,
  },
  {
    label: "Help & Docs",
    href: "/admin/help",
    icon: navigationIcons.help,
  },
];

// Filter options - counts will be dynamic in production
const languageFilters = [
  { value: "luganda", label: "Luganda" },
  { value: "krio", label: "Krio" },
];

const modelFilters = [
  { value: "orpheus", label: "Orpheus" },
  { value: "nemo", label: "NeMo" },
  { value: "ground", label: "Ground Truth" },
];

const dateRangeOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

interface SidebarNavLinkProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  badgeCounts: BadgeCounts;
}

function SidebarNavLink({ item, isActive, isCollapsed, badgeCounts }: SidebarNavLinkProps) {
  const badge = item.badgeKey ? badgeCounts[item.badgeKey] : null;
  const displayBadge = badge && badge > 0 
    ? (item.badgeKey === "activeRaters" ? `${badge} active` : badge)
    : null;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
        "hover:bg-default-100",
        isActive
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "text-default-600 hover:text-default-900",
        isCollapsed && "justify-center px-2"
      )}
    >
      <Icon icon={item.icon} className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {displayBadge && (
            <Chip 
              size="sm" 
              variant="flat" 
              color={item.badgeColor || "default"}
              classNames={{
                base: isActive ? "bg-primary-foreground/20 text-primary-foreground" : "",
              }}
            >
              {displayBadge}
            </Chip>
          )}
        </>
      )}
    </Link>
  );
}

interface SidebarContentProps {
  isCollapsed: boolean;
  onClose?: () => void;
}

function SidebarContent({ isCollapsed, onClose }: SidebarContentProps) {
  const pathname = usePathname();
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({
    samples: 0,
    activeRaters: 0,
    ratings: 0,
  });

  // Fetch real badge counts from API
  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setBadgeCounts({
            samples: data.totalSamples || 0,
            activeRaters: data.activeSessions || 0,
            ratings: data.totalRatings || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch badge counts:", error);
      }
    }
    fetchCounts();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        {/* Main Navigation */}
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <div key={item.href} onClick={onClose}>
              <SidebarNavLink
                item={item}
                isActive={isActive(item.href)}
                isCollapsed={isCollapsed}
                badgeCounts={badgeCounts}
              />
            </div>
          ))}
        </nav>

        <Divider className="my-4" />

        {/* Study Management */}
        {!isCollapsed && (
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-default-400">
            Studies
          </p>
        )}
        <nav className="space-y-1">
          {studyNavItems.map((item) => (
            <div key={item.href} onClick={onClose}>
              <SidebarNavLink
                item={item}
                isActive={isActive(item.href)}
                isCollapsed={isCollapsed}
                badgeCounts={badgeCounts}
              />
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-divider p-3 flex-shrink-0">
        <nav className="space-y-1">
          {secondaryNavItems.map((item) => (
            <div key={item.href} onClick={onClose}>
              <SidebarNavLink
                item={item}
                isActive={isActive(item.href)}
                isCollapsed={isCollapsed}
                badgeCounts={badgeCounts}
              />
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-divider bg-default-50 transition-all duration-300 overflow-hidden",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Collapse Toggle */}
      <div className="flex h-12 items-center justify-end px-2 border-b border-divider flex-shrink-0">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon
            icon={isCollapsed ? "solar:alt-arrow-right-linear" : "solar:alt-arrow-left-linear"}
            className="h-4 w-4"
          />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarContent isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const { isOpen, closeMobileSidebar } = useSidebar();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
        onClick={closeMobileSidebar}
      />
      
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-background shadow-xl lg:hidden">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-divider px-4">
          <div className="flex items-center gap-2">
            <Icon icon="solar:graph-bold-duotone" className="h-6 w-6 text-primary" />
            <span className="font-semibold">OpenMOS Admin</span>
          </div>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={closeMobileSidebar}
            aria-label="Close menu"
          >
            <Icon icon={navigationIcons.close} className="h-5 w-5" />
          </Button>
        </div>
        <SidebarContent isCollapsed={false} onClose={closeMobileSidebar} />
      </aside>
    </>
  );
}
