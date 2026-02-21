"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

import { useSidebar } from "./sidebar-context";
import {
  navigationIcons,
  quickActionIcons,
  notificationIcons,
  userIcons,
} from "./icons";
import { Logo } from "@/components/icons";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
}

export function TopNavbar() {
  const { openMobileSidebar } = useSidebar();
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/admin/notifications?limit=5");
        const data = await res.json();

        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    }

    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "rater_started":
        return "solar:user-plus-bold-duotone";
      case "rater_completed":
        return "solar:check-circle-bold-duotone";
      case "samples_uploaded":
        return "solar:upload-bold-duotone";
      case "rating_milestone":
        return "solar:star-bold-duotone";
      case "export_completed":
        return "solar:file-download-bold-duotone";
      default:
        return "solar:bell-bold-duotone";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-divider bg-background/80 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Section - Logo & Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <Button
            isIconOnly
            aria-label="Open menu"
            className="lg:hidden"
            variant="light"
            onPress={openMobileSidebar}
          >
            <Icon className="h-6 w-6" icon={navigationIcons.menu} />
          </Button>

          {/* Logo */}
          <Link className="flex items-center gap-2" href="/admin">
            <Logo size={32} />
            <span className="hidden text-lg font-semibold sm:block">
              OpenMOS
            </span>
          </Link>
        </div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center gap-2">
          {/* Quick Actions Dropdown */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button
                className="hidden sm:flex"
                startContent={
                  <Icon className="h-4 w-4" icon="solar:bolt-bold-duotone" />
                }
                variant="flat"
              >
                Quick Actions
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Quick Actions" className="w-64">
              <DropdownSection title="Quick Actions">
                <DropdownItem
                  key="upload"
                  description="Add new audio files"
                  href="/admin/upload"
                  startContent={
                    <Icon
                      className="h-5 w-5 text-primary"
                      icon={quickActionIcons.upload}
                    />
                  }
                >
                  Upload Audio Samples
                </DropdownItem>
                <DropdownItem
                  key="export"
                  description="Download as CSV"
                  href="/admin/export"
                  startContent={
                    <Icon
                      className="h-5 w-5 text-success"
                      icon={quickActionIcons.download}
                    />
                  }
                >
                  Export Dataset
                </DropdownItem>
                <DropdownItem
                  key="report"
                  description="Generate PDF analysis"
                  href="/admin/reports"
                  startContent={
                    <Icon
                      className="h-5 w-5 text-warning"
                      icon={quickActionIcons.report}
                    />
                  }
                >
                  Generate Report
                </DropdownItem>
                <DropdownItem
                  key="new-study"
                  description="Create new evaluation"
                  href="/admin/studies/new"
                  startContent={
                    <Icon
                      className="h-5 w-5 text-secondary"
                      icon={quickActionIcons.newStudy}
                    />
                  }
                >
                  Start New Study
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>

          {/* Notifications Dropdown */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button isIconOnly aria-label="Notifications" variant="light">
                <Badge
                  color="danger"
                  content={unreadCount}
                  isInvisible={unreadCount === 0}
                  size="sm"
                >
                  <Icon
                    className="h-5 w-5"
                    icon={
                      unreadCount > 0
                        ? notificationIcons.bellRinging
                        : notificationIcons.bell
                    }
                  />
                </Badge>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Notifications" className="w-80">
              <DropdownSection
                showDivider={unreadCount > 0}
                title="Notifications"
              >
                {notifications.length === 0 ? (
                  <DropdownItem
                    key="empty"
                    isReadOnly
                    className="text-center py-4"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon
                        className="h-8 w-8 text-default-300"
                        icon="solar:bell-off-bold-duotone"
                      />
                      <span className="text-default-400">
                        No notifications yet
                      </span>
                    </div>
                  </DropdownItem>
                ) : (
                  notifications.map((notification) => (
                    <DropdownItem
                      key={notification.id}
                      classNames={{
                        base: notification.read ? "opacity-60" : "",
                      }}
                      description={notification.timeAgo}
                      startContent={
                        <Icon
                          className="h-5 w-5 text-primary"
                          icon={getNotificationIcon(notification.type)}
                        />
                      }
                    >
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                        <span className="text-sm">{notification.title}</span>
                      </div>
                    </DropdownItem>
                  ))
                )}
              </DropdownSection>
              {unreadCount > 0 ? (
                <DropdownSection>
                  <DropdownItem
                    key="mark-read"
                    className="text-xs text-center text-primary"
                    onPress={markAllAsRead}
                  >
                    Mark all as read
                  </DropdownItem>
                </DropdownSection>
              ) : (
                <DropdownSection className="hidden">
                  <DropdownItem key="empty-action" className="hidden" />
                </DropdownSection>
              )}
            </DropdownMenu>
          </Dropdown>

          {/* User Menu Dropdown */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button className="h-auto gap-2 px-2 py-1" variant="light">
                <Avatar
                  className="h-8 w-8"
                  name={
                    session?.user?.fullName || session?.user?.username || "User"
                  }
                  size="sm"
                />
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium leading-tight">
                    {session?.user?.fullName ||
                      session?.user?.username ||
                      "Researcher"}
                  </p>
                  <p className="text-xs text-default-500">
                    {session?.user?.role || "researcher"}
                  </p>
                </div>
                <Icon
                  className="h-4 w-4 hidden md:block"
                  icon="solar:alt-arrow-down-linear"
                />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu" className="w-64">
              <DropdownSection showDivider>
                <DropdownItem
                  key="profile"
                  isReadOnly
                  className="cursor-default"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">
                      {session?.user?.fullName ||
                        session?.user?.username ||
                        "Researcher"}
                    </p>
                    <p className="text-xs text-default-500">
                      {session?.user?.email}
                    </p>
                    <Chip
                      className="mt-1"
                      color="primary"
                      size="sm"
                      variant="flat"
                    >
                      {session?.user?.role || "researcher"}
                    </Chip>
                  </div>
                </DropdownItem>
              </DropdownSection>
              <DropdownSection showDivider>
                <DropdownItem
                  key="my-profile"
                  href="/admin/profile"
                  startContent={
                    <Icon className="h-4 w-4" icon={userIcons.userCircle} />
                  }
                >
                  My Profile
                </DropdownItem>
                <DropdownItem
                  key="settings"
                  href="/admin/settings"
                  startContent={
                    <Icon className="h-4 w-4" icon={navigationIcons.settings} />
                  }
                >
                  Settings
                </DropdownItem>
                <DropdownItem
                  key="activity"
                  href="/admin/activity"
                  startContent={
                    <Icon
                      className="h-4 w-4"
                      icon={navigationIcons.pastStudies}
                    />
                  }
                >
                  Activity Log
                </DropdownItem>
              </DropdownSection>
              <DropdownSection>
                <DropdownItem
                  key="logout"
                  color="danger"
                  startContent={
                    <Icon className="h-4 w-4" icon={navigationIcons.logout} />
                  }
                  onPress={() => signOut({ callbackUrl: "/" })}
                >
                  Sign Out
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
