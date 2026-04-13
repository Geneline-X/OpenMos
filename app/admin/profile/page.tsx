"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [isEditingName, setIsEditingName] = useState(false);
  const [fullName, setFullName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong"
  >("weak");

  useEffect(() => {
    if (session?.user?.fullName) {
      setFullName(session.user.fullName);
    }
  }, [session]);

  useEffect(() => {
    // Calculate password strength
    if (newPassword.length === 0) {
      setPasswordStrength("weak");

      return;
    }

    let strength = 0;

    if (newPassword.length >= 12) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[a-z]/.test(newPassword)) strength++;
    if (/\d/.test(newPassword)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) strength++;

    if (strength >= 5) setPasswordStrength("strong");
    else if (strength >= 3) setPasswordStrength("medium");
    else setPasswordStrength("weak");
  }, [newPassword]);

  const handleSaveName = async () => {
    if (!fullName || fullName.trim().length < 2) {
      toast.error("Name must be at least 2 characters");

      return;
    }

    setIsSavingName(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update name");
      }

      // Update the session with new name
      await updateSession({ fullName: fullName.trim() });

      toast.success("Name updated successfully");
      setIsEditingName(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update name",
      );
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");

      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");

      return;
    }

    if (newPassword === oldPassword) {
      toast.error("New password must be different from old password");

      return;
    }

    if (newPassword.length < 12) {
      toast.error("Password must be at least 12 characters");

      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      toast.error("Password must contain at least one uppercase letter");

      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      toast.error("Password must contain at least one lowercase letter");

      return;
    }

    if (!/\d/.test(newPassword)) {
      toast.error("Password must contain at least one number");

      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      toast.error("Password must contain at least one special character");

      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/admin/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      toast.success("Password changed successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to change password",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case "strong":
        return "success";
      case "medium":
        return "warning";
      default:
        return "danger";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-default-500">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Icon
            className="h-5 w-5 text-primary"
            icon="solar:user-circle-bold-duotone"
          />
          <h2 className="text-lg font-semibold">Profile Information</h2>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Full Name</p>
            {isEditingName ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Button
                  color="primary"
                  isDisabled={!fullName || fullName.trim().length < 2}
                  isLoading={isSavingName}
                  onPress={handleSaveName}
                >
                  Save
                </Button>
                <Button
                  isDisabled={isSavingName}
                  variant="flat"
                  onPress={() => {
                    setFullName(session?.user?.fullName || "");
                    setIsEditingName(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-default-700">
                  {session?.user?.fullName || "Not set"}
                </p>
                <Button
                  size="sm"
                  startContent={
                    <Icon className="h-4 w-4" icon="solar:pen-bold" />
                  }
                  variant="flat"
                  onPress={() => setIsEditingName(true)}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>

          <Divider />

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Email</p>
            <p className="text-default-700">{session?.user?.email}</p>
          </div>

          <Divider />

          {/* Username (Read-only) */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Username</p>
            <p className="text-default-700">{session?.user?.username}</p>
          </div>

          <Divider />

          {/* Role (Read-only) */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Role</p>
            <div>
              <Chip color="primary" size="sm" variant="flat">
                {session?.user?.role || "researcher"}
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Icon
            className="h-5 w-5 text-primary"
            icon="solar:shield-check-bold-duotone"
          />
          <h2 className="text-lg font-semibold">Security</h2>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="space-y-4">
            <h3 className="font-medium">Change Password</h3>

            <Input
              label="Current Password"
              placeholder="Enter your current password"
              startContent={
                <Icon className="h-4 w-4" icon="solar:lock-password-linear" />
              }
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />

            <Input
              description="Min 12 characters, uppercase, lowercase, number, and special character"
              label="New Password"
              placeholder="Enter your new password"
              startContent={
                <Icon className="h-4 w-4" icon="solar:lock-password-bold" />
              }
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            {newPassword && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-default-500">
                  Password strength:
                </span>
                <Chip
                  color={getPasswordStrengthColor()}
                  size="sm"
                  variant="flat"
                >
                  {passwordStrength}
                </Chip>
              </div>
            )}

            <Input
              label="Confirm New Password"
              placeholder="Confirm your new password"
              startContent={
                <Icon className="h-4 w-4" icon="solar:lock-password-bold" />
              }
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              className="w-full sm:w-auto"
              color="primary"
              isDisabled={!oldPassword || !newPassword || !confirmPassword}
              isLoading={isChangingPassword}
              onPress={handleChangePassword}
            >
              Change Password
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
