"use client";

import type { AdminRole } from "@/lib/db/schema";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/dropdown";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";

import { formatRole, getRoleIcon, getRoleColor } from "@/lib/auth/utils";

interface AdminHeaderProps {
  showSessionWarning?: boolean;
}

export function AdminHeader({ showSessionWarning = true }: AdminHeaderProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);

  // Session expiry countdown (simplified - real implementation would check actual expiry)
  useEffect(() => {
    if (!session || !showSessionWarning) return;

    const checkExpiry = () => {
      // In real implementation, this would calculate from session.expires
      // For now, we'll simulate a countdown
      const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours in ms
      const warningThreshold = 5 * 60 * 1000; // 5 minutes

      // This is a placeholder - actual implementation would use session.expires
      setTimeRemaining("7h 55m");
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [session, showSessionWarning]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
    router.refresh();
  };

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="w-8 h-8 bg-default-200 rounded-full" />
        <div className="w-24 h-4 bg-default-200 rounded" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const role = user.role as AdminRole;

  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button className="gap-2 px-2" variant="light">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon
                className="w-6 h-6 text-primary"
                icon="solar:user-circle-bold-duotone"
              />
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium">
                {user.fullName || user.username}
              </span>
              <span className="text-xs text-default-400">
                {formatRole(role)}
              </span>
            </div>
            <Icon
              className="w-4 h-4 text-default-400"
              icon="solar:alt-arrow-down-linear"
            />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="User menu" className="w-64">
          <DropdownSection showDivider>
            <DropdownItem
              key="profile"
              isReadOnly
              className="h-auto py-3"
              textValue="Profile"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon
                    className="w-7 h-7 text-primary"
                    icon="solar:user-circle-bold-duotone"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-xs text-default-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <Chip
                  color={getRoleColor(role)}
                  size="sm"
                  startContent={
                    <Icon className="w-3 h-3" icon={getRoleIcon(role)} />
                  }
                  variant="flat"
                >
                  {formatRole(role)}
                </Chip>
              </div>
            </DropdownItem>
          </DropdownSection>

          <DropdownSection showDivider>
            <DropdownItem
              key="settings"
              startContent={
                <Icon className="w-4 h-4" icon="solar:settings-linear" />
              }
              onPress={() => router.push("/admin/settings")}
            >
              Settings
            </DropdownItem>
            <DropdownItem
              key="activity"
              className={
                role === "viewer" || role === "researcher" ? "hidden" : ""
              }
              startContent={
                <Icon className="w-4 h-4" icon="solar:history-linear" />
              }
              onPress={() => router.push("/admin/audit-logs")}
            >
              Activity Log
            </DropdownItem>
          </DropdownSection>

          <DropdownSection>
            <DropdownItem
              key="session"
              isReadOnly
              className={`text-default-400 text-xs ${!timeRemaining ? "hidden" : ""}`}
              textValue="Session info"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" icon="solar:clock-circle-linear" />
                <span>Session expires in {timeRemaining || "N/A"}</span>
              </div>
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              startContent={
                <Icon className="w-4 h-4" icon="solar:logout-linear" />
              }
              onPress={onOpen}
            >
              Sign Out
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>

      {/* Sign Out Confirmation Modal */}
      <Modal isOpen={isOpen} size="sm" onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col items-center gap-2 pt-6">
            <div className="p-3 rounded-full bg-danger/10">
              <Icon
                className="w-8 h-8 text-danger"
                icon="solar:logout-bold-duotone"
              />
            </div>
            <h3 className="text-lg font-semibold">Sign Out?</h3>
          </ModalHeader>
          <ModalBody className="text-center pb-2">
            <p className="text-default-500">
              Are you sure you want to sign out of your account?
            </p>
          </ModalBody>
          <ModalFooter className="justify-center gap-2 pb-6">
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleSignOut}>
              Sign Out
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Session Expiry Warning Modal */}
      <Modal
        hideCloseButton
        isOpen={showExpiryWarning}
        size="sm"
        onClose={() => setShowExpiryWarning(false)}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col items-center gap-2 pt-6">
            <div className="p-3 rounded-full bg-warning/10">
              <Icon
                className="w-8 h-8 text-warning"
                icon="solar:clock-circle-bold-duotone"
              />
            </div>
            <h3 className="text-lg font-semibold">Session Expiring Soon</h3>
          </ModalHeader>
          <ModalBody className="text-center pb-2">
            <p className="text-default-500">
              You&apos;ll be logged out in 5 minutes due to inactivity.
            </p>
          </ModalBody>
          <ModalFooter className="justify-center gap-2 pb-6">
            <Button color="danger" variant="light" onPress={handleSignOut}>
              Log Out Now
            </Button>
            <Button
              color="primary"
              onPress={() => {
                setShowExpiryWarning(false);
                // In real implementation, this would extend the session
                fetch("/api/auth/extend-session", { method: "POST" });
              }}
            >
              Stay Logged In
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
