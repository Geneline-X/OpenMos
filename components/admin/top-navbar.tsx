"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  DropdownSection 
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

import { useSidebar } from "./sidebar-context";
import { 
  logoIcon, 
  navigationIcons, 
  quickActionIcons, 
  notificationIcons,
  userIcons
} from "./icons";

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
      case "rater_started": return "solar:user-plus-bold-duotone";
      case "rater_completed": return "solar:check-circle-bold-duotone";
      case "samples_uploaded": return "solar:upload-bold-duotone";
      case "rating_milestone": return "solar:star-bold-duotone";
      case "export_completed": return "solar:file-download-bold-duotone";
      default: return "solar:bell-bold-duotone";
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
            variant="light"
            className="lg:hidden"
            onPress={openMobileSidebar}
            aria-label="Open menu"
          >
            <Icon icon={navigationIcons.menu} className="h-6 w-6" />
          </Button>

          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Icon icon={logoIcon} className="h-5 w-5 text-primary" />
            </div>
            <span className="hidden text-lg font-semibold sm:block">OpenMOS</span>
          </Link>
        </div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center gap-2">
          {/* Quick Actions Dropdown */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button 
                variant="flat" 
                className="hidden sm:flex"
                startContent={<Icon icon="solar:bolt-bold-duotone" className="h-4 w-4" />}
              >
                Quick Actions
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Quick Actions" className="w-64">
              <DropdownSection title="Quick Actions">
                <DropdownItem
                  key="upload"
                  description="Add new audio files"
                  startContent={<Icon icon={quickActionIcons.upload} className="h-5 w-5 text-primary" />}
                  href="/admin/upload"
                >
                  Upload Audio Samples
                </DropdownItem>
                <DropdownItem
                  key="export"
                  description="Download as CSV"
                  startContent={<Icon icon={quickActionIcons.download} className="h-5 w-5 text-success" />}
                  href="/admin/export"
                >
                  Export Dataset
                </DropdownItem>
                <DropdownItem
                  key="report"
                  description="Generate PDF analysis"
                  startContent={<Icon icon={quickActionIcons.report} className="h-5 w-5 text-warning" />}
                  href="/admin/reports"
                >
                  Generate Report
                </DropdownItem>
                <DropdownItem
                  key="new-study"
                  description="Create new evaluation"
                  startContent={<Icon icon={quickActionIcons.newStudy} className="h-5 w-5 text-secondary" />}
                  href="/admin/studies/new"
                >
                  Start New Study
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>

          {/* Notifications Dropdown */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button isIconOnly variant="light" aria-label="Notifications">
                <Badge 
                  content={unreadCount} 
                  color="danger" 
                  size="sm"
                  isInvisible={unreadCount === 0}
                >
                  <Icon 
                    icon={unreadCount > 0 ? notificationIcons.bellRinging : notificationIcons.bell} 
                    className="h-5 w-5" 
                  />
                </Badge>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Notifications" className="w-80">
              <DropdownSection 
                title="Notifications" 
                showDivider={unreadCount > 0}
              >
                {notifications.length === 0 ? (
                  <DropdownItem key="empty" isReadOnly className="text-center py-4">
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="solar:bell-off-bold-duotone" className="h-8 w-8 text-default-300" />
                      <span className="text-default-400">No notifications yet</span>
                    </div>
                  </DropdownItem>
                ) : (
                  notifications.map((notification) => (
                    <DropdownItem
                      key={notification.id}
                      description={notification.timeAgo}
                      classNames={{
                        base: notification.read ? "opacity-60" : "",
                      }}
                      startContent={
                        <Icon 
                          icon={getNotificationIcon(notification.type)} 
                          className="h-5 w-5 text-primary" 
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
              <Button variant="light" className="h-auto gap-2 px-2 py-1">
                <Avatar
                  size="sm"
                  name={session?.user?.fullName || session?.user?.username || "User"}
                  className="h-8 w-8"
                />
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium leading-tight">
                    {session?.user?.fullName || session?.user?.username || "Researcher"}
                  </p>
                  <p className="text-xs text-default-500">
                    {session?.user?.role || "researcher"}
                  </p>
                </div>
                <Icon icon="solar:alt-arrow-down-linear" className="h-4 w-4 hidden md:block" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu" className="w-64">
              <DropdownSection showDivider>
                <DropdownItem key="profile" isReadOnly className="cursor-default">
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">{session?.user?.fullName || session?.user?.username || "Researcher"}</p>
                    <p className="text-xs text-default-500">{session?.user?.email}</p>
                    <Chip size="sm" variant="flat" color="primary" className="mt-1">
                      {session?.user?.role || "researcher"}
                    </Chip>
                  </div>
                </DropdownItem>
              </DropdownSection>
              <DropdownSection showDivider>
                <DropdownItem
                  key="my-profile"
                  startContent={<Icon icon={userIcons.userCircle} className="h-4 w-4" />}
                  href="/admin/profile"
                >
                  My Profile
                </DropdownItem>
                <DropdownItem
                  key="settings"
                  startContent={<Icon icon={navigationIcons.settings} className="h-4 w-4" />}
                  href="/admin/settings"
                >
                  Settings
                </DropdownItem>
                <DropdownItem
                  key="activity"
                  startContent={<Icon icon={navigationIcons.pastStudies} className="h-4 w-4" />}
                  href="/admin/activity"
                >
                  Activity Log
                </DropdownItem>
              </DropdownSection>
              <DropdownSection>
                <DropdownItem
                  key="logout"
                  color="danger"
                  startContent={<Icon icon={navigationIcons.logout} className="h-4 w-4" />}
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
