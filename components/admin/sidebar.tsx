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
  href: string; // Used as ID for parent items if no direct link
  icon: string;
  badgeKey?: "samples" | "activeRaters" | "ratings";
  badgeColor?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  children?: NavItem[];
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
    label: "Studies",
    href: "#studies", // Parent container
    icon: navigationIcons.currentStudy,
    children: [
      {
        label: "Current Study",
        href: "/admin/studies/current",
        icon: navigationIcons.currentStudy,
      },
      {
        label: "Manage Studies",
        href: "/admin/studies",
        icon: "solar:cat-bold-duotone", // Differentiating icon
      },
      {
        label: "Past Studies",
        href: "/admin/studies?filter=past",
        icon: navigationIcons.pastStudies,
      },
    ],
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

interface SidebarNavLinkProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  badgeCounts: BadgeCounts;
  isChild?: boolean;
  onNavigate?: () => void;
  pathname: string;
}

function SidebarNavLink({
  item,
  isActive,
  isCollapsed,
  badgeCounts,
  isChild = false,
  onNavigate,
  pathname,
}: SidebarNavLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const badge = item.badgeKey ? badgeCounts[item.badgeKey] : null;
  const displayBadge =
    badge && badge > 0
      ? item.badgeKey === "activeRaters"
        ? `${badge} active`
        : badge
      : null;

  const hasChildren = item.children && item.children.length > 0;

  // Check if any child is active to auto-expand
  useEffect(() => {
    if (hasChildren && item.children) {
      const isChildActive = item.children.some(
        (child) =>
          pathname === child.href || pathname.startsWith(child.href + "/"),
      );

      if (isChildActive) {
        setIsOpen(true);
      }
    }
  }, [pathname, hasChildren, item.children]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const Component = hasChildren ? "div" : Link;
  const props = hasChildren
    ? { onClick: toggleOpen, role: "button", className: "cursor-pointer" }
    : { href: item.href, onClick: onNavigate };

  return (
    <>
      <Component
        {...(props as any)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
          "hover:bg-default-100",
          isActive && !hasChildren
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "text-default-600 hover:text-default-900",
          isCollapsed && "justify-center px-2",
          isChild && "pl-9 text-xs", // Indent children
        )}
      >
        <Icon
          className={cn("h-5 w-5 flex-shrink-0", isChild && "h-4 w-4")}
          icon={item.icon}
        />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {displayBadge && (
              <Chip
                classNames={{
                  base: isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "",
                }}
                color={item.badgeColor || "default"}
                size="sm"
                variant="flat"
              >
                {displayBadge}
              </Chip>
            )}
            {hasChildren && (
              <Icon
                className="h-4 w-4 text-default-400"
                icon={
                  isOpen
                    ? "solar:alt-arrow-up-linear"
                    : "solar:alt-arrow-down-linear"
                }
              />
            )}
          </>
        )}
      </Component>

      {/* Recursively render children */}
      {!isCollapsed && hasChildren && isOpen && (
        <div className="mt-1 space-y-1">
          {item.children?.map((child) => (
            <SidebarNavLink
              key={child.href}
              badgeCounts={badgeCounts}
              isActive={
                pathname === child.href || pathname.startsWith(child.href + "/")
              }
              isChild={true}
              isCollapsed={isCollapsed}
              item={child}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </>
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
    if (href.startsWith("#")) return false; // Parents are never "active" in the same way

    return (
      pathname === href || (pathname.startsWith(href) && href !== "/admin")
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        {/* Main Navigation */}
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <div key={item.href}>
              <SidebarNavLink
                badgeCounts={badgeCounts}
                isActive={isActive(item.href)}
                isCollapsed={isCollapsed}
                item={item}
                pathname={pathname}
                onNavigate={onClose}
              />
            </div>
          ))}
        </nav>

        <Divider className="my-4" />

        {/* Study Management (Merged into unified list style without separate header) */}
        <nav className="space-y-1">
          {studyNavItems.map((item) => (
            <div key={item.href}>
              <SidebarNavLink
                badgeCounts={badgeCounts}
                isActive={isActive(item.href)}
                isCollapsed={isCollapsed}
                item={item}
                pathname={pathname}
                onNavigate={onClose}
              />
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-divider p-3 flex-shrink-0">
        <nav className="space-y-1">
          {secondaryNavItems.map((item) => (
            <div key={item.href}>
              <SidebarNavLink
                badgeCounts={badgeCounts}
                isActive={isActive(item.href)}
                isCollapsed={isCollapsed}
                item={item}
                pathname={pathname}
                onNavigate={onClose}
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
        isCollapsed ? "w-16" : "w-60",
      )}
    >
      {/* Collapse Toggle */}
      <div className="flex h-12 items-center justify-end px-2 border-b border-divider flex-shrink-0">
        <Button
          isIconOnly
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          size="sm"
          variant="light"
          onPress={toggleSidebar}
        >
          <Icon
            className="h-4 w-4"
            icon={
              isCollapsed
                ? "solar:alt-arrow-right-linear"
                : "solar:alt-arrow-left-linear"
            }
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
            <Icon
              className="h-6 w-6 text-primary"
              icon="solar:graph-bold-duotone"
            />
            <span className="font-semibold">OpenMOS Admin</span>
          </div>
          <Button
            isIconOnly
            aria-label="Close menu"
            size="sm"
            variant="light"
            onPress={closeMobileSidebar}
          >
            <Icon className="h-5 w-5" icon={navigationIcons.close} />
          </Button>
        </div>
        <SidebarContent isCollapsed={false} onClose={closeMobileSidebar} />
      </aside>
    </>
  );
}
