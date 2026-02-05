"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { RadioGroup, Radio } from "@heroui/radio";
import { addToast } from "@heroui/toast";
import {
  formatRole,
  getRoleIcon,
  getRoleColor,
  PERMISSIONS,
  type Permission,
} from "@/lib/auth/utils";
import type { AdminRole } from "@/lib/db/schema";

interface TeamMember {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  role: AdminRole;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  expiresAt: string;
}

export default function UsersSettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  // Invite modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [inviteData, setInviteData] = useState({
    email: "",
    fullName: "",
    role: "researcher" as AdminRole,
  });
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // Check permission
  const canManageUsers = session?.user?.role === "owner";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [usersRes, invitesRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/invitations"),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users);
      }

      if (invitesRes.ok) {
        const data = await invitesRes.json();
        setInvitations(data.invitations);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    setInviteError("");

    if (!inviteData.email) {
      setInviteError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteData.email)) {
      setInviteError("Please enter a valid email");
      return;
    }

    setIsInviting(true);

    try {
      const response = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invitation");
      }

      addToast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteData.email}`,
        color: "success",
      });

      setInviteData({ email: "", fullName: "", role: "researcher" });
      onClose();
      fetchUsers();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleResendInvite = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/invitations/${id}/resend`, {
        method: "POST",
      });

      if (response.ok) {
        addToast({
          title: "Invitation Resent",
          description: "A new invitation email has been sent",
          color: "success",
        });
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to resend invitation",
        color: "danger",
      });
    }
  };

  const handleRevokeInvite = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/invitations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        addToast({
          title: "Invitation Revoked",
          description: "The invitation has been revoked",
          color: "success",
        });
        fetchUsers();
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to revoke invitation",
        color: "danger",
      });
    }
  };

  const handleToggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        addToast({
          title: currentStatus ? "User Deactivated" : "User Activated",
          description: `User has been ${currentStatus ? "deactivated" : "activated"}`,
          color: "success",
        });
        fetchUsers();
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to update user status",
        color: "danger",
      });
    }
  };

  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!canManageUsers) {
    return (
      <div className="p-6">
        <Card>
          <CardBody className="flex flex-col items-center gap-4 py-12">
            <Icon
              icon="solar:shield-warning-bold-duotone"
              className="w-16 h-16 text-warning"
            />
            <h2 className="text-xl font-bold">Access Denied</h2>
            <p className="text-default-500 text-center max-w-sm">
              You don&apos;t have permission to manage team members.
              Only the project owner can access this page.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" label="Loading team members..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon
            icon="solar:users-group-rounded-bold-duotone"
            className="w-8 h-8 text-primary"
          />
          <div>
            <h1 className="text-2xl font-bold">Team Members</h1>
            <p className="text-default-500 text-sm">
              Manage researcher access to OpenMOS
            </p>
          </div>
        </div>
        <Button
          color="primary"
          onPress={onOpen}
          startContent={<Icon icon="solar:user-plus-bold-duotone" className="w-5 h-5" />}
        >
          Invite Researcher
        </Button>
      </div>

      {/* Active Users */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Active Team ({users.length})</h2>
        </CardHeader>
        <CardBody className="p-0">
          <Table aria-label="Team members table" removeWrapper>
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>LAST LOGIN</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center">
                        <Icon
                          icon="solar:user-bold-duotone"
                          className="w-5 h-5 text-default-500"
                        />
                      </div>
                      <span className="font-medium">
                        {user.fullName || user.username}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      color={getRoleColor(user.role)}
                      variant="flat"
                      size="sm"
                      startContent={
                        <Icon icon={getRoleIcon(user.role)} className="w-4 h-4" />
                      }
                    >
                      {formatRole(user.role)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={user.isActive ? "success" : "danger"}
                      variant="dot"
                      size="sm"
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-default-500 text-sm">
                    {getRelativeTime(user.lastLogin)}
                  </TableCell>
                  <TableCell>
                    {user.role !== "owner" && (
                      <Button
                        size="sm"
                        variant="light"
                        color={user.isActive ? "danger" : "success"}
                        onPress={() => handleToggleUserStatus(user.id, user.isActive)}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold">
              Pending Invitations ({invitations.length})
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            <Table aria-label="Pending invitations table" removeWrapper>
              <TableHeader>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>SENT</TableColumn>
                <TableColumn>EXPIRES</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {invitations.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>
                      <Chip
                        color={getRoleColor(invite.role)}
                        variant="flat"
                        size="sm"
                      >
                        {formatRole(invite.role)}
                      </Chip>
                    </TableCell>
                    <TableCell className="text-default-500 text-sm">
                      {getRelativeTime(invite.createdAt)}
                    </TableCell>
                    <TableCell className="text-default-500 text-sm">
                      {new Date(invite.expiresAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => handleResendInvite(invite.id)}
                        >
                          Resend
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => handleRevokeInvite(invite.id)}
                        >
                          Revoke
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Invite Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <Icon icon="solar:user-plus-bold-duotone" className="w-6 h-6 text-primary" />
            Invite Team Member
          </ModalHeader>
          <ModalBody>
            {inviteError && (
              <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20">
                <div className="flex items-center gap-2 text-danger">
                  <Icon icon="solar:danger-circle-bold-duotone" className="w-5 h-5" />
                  <span className="text-sm">{inviteError}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Email Address"
                placeholder="researcher@university.edu"
                type="email"
                value={inviteData.email}
                onChange={(e) =>
                  setInviteData((prev) => ({ ...prev, email: e.target.value }))
                }
                startContent={
                  <Icon icon="solar:letter-linear" className="w-5 h-5 text-default-400" />
                }
              />

              <Input
                label="Full Name (optional)"
                placeholder="Dr. Jane Smith"
                value={inviteData.fullName}
                onChange={(e) =>
                  setInviteData((prev) => ({ ...prev, fullName: e.target.value }))
                }
                startContent={
                  <Icon icon="solar:user-linear" className="w-5 h-5 text-default-400" />
                }
              />

              <RadioGroup
                label="Role"
                value={inviteData.role}
                onValueChange={(value) =>
                  setInviteData((prev) => ({ ...prev, role: value as AdminRole }))
                }
              >
                <Radio value="admin" description="Full access except user management">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:shield-check-bold-duotone" className="w-4 h-4" />
                    Admin
                  </div>
                </Radio>
                <Radio value="researcher" description="Upload samples and export data">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:flask-bold-duotone" className="w-4 h-4" />
                    Researcher (Recommended)
                  </div>
                </Radio>
                <Radio value="viewer" description="View-only access to dashboard">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:eye-bold-duotone" className="w-4 h-4" />
                    Viewer
                  </div>
                </Radio>
              </RadioGroup>

              {/* Permissions Preview */}
              <div className="p-4 rounded-lg bg-default-100">
                <p className="text-sm font-medium mb-2">Permissions Preview:</p>
                <ul className="space-y-1">
                  {Object.entries(PERMISSIONS[inviteData.role]).map(
                    ([permission, allowed]) => (
                      <li
                        key={permission}
                        className={`flex items-center gap-2 text-xs ${
                          allowed ? "text-success" : "text-default-400"
                        }`}
                      >
                        <Icon
                          icon={
                            allowed
                              ? "solar:check-circle-bold"
                              : "solar:close-circle-linear"
                          }
                          className="w-4 h-4"
                        />
                        {permission
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" isLoading={isInviting} onPress={handleInvite}>
              Send Invitation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
