"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { addToast } from "@heroui/toast";
import { validatePassword, formatRole, getRoleIcon } from "@/lib/auth/utils";

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isValidating, setIsValidating] = useState(true);
  const [invitation, setInvitation] = useState<{
    email: string;
    role: string;
    inviterName: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<{
    strength: "weak" | "medium" | "strong";
  }>({ strength: "weak" });

  // Coming Soon modal for OAuth
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [comingSoonProvider, setComingSoonProvider] = useState("");

  const handleOAuthClick = (provider: string) => {
    setComingSoonProvider(provider);
    onOpen();
  };

  // Validate invitation token
  useEffect(() => {
    const validateInvitation = async () => {
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/validate-invitation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.valid) {
          setInvitation({
            email: data.email,
            role: data.role,
            inviterName: data.inviterName,
          });
        }
      } catch (err) {
        console.error("Invitation validation error:", err);
      } finally {
        setIsValidating(false);
      }
    };

    validateInvitation();
  }, [token]);

  // Password strength check
  useEffect(() => {
    if (formData.password) {
      const result = validatePassword(formData.password, undefined, invitation?.email);
      setPasswordStrength({ strength: result.strength });
    } else {
      setPasswordStrength({ strength: "weak" });
    }
  }, [formData.password, invitation?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.fullName.trim()) {
      setErrors({ fullName: "Full name is required" });
      return;
    }

    const validation = validatePassword(formData.password, undefined, invitation?.email);
    if (!validation.isValid) {
      setErrors({ password: validation.errors[0] });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/accept-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          fullName: formData.fullName,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept invitation");
      }

      addToast({
        title: "Welcome to OpenMOS!",
        description: "Your account has been created",
        color: "success",
      });
      router.push("/admin/login?welcome=true");
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Failed to accept invitation",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength.strength) {
      case "strong":
        return "success";
      case "medium":
        return "warning";
      default:
        return "danger";
    }
  };

  const getStrengthValue = () => {
    switch (passwordStrength.strength) {
      case "strong":
        return 100;
      case "medium":
        return 50;
      default:
        return 25;
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Spinner size="lg" label="Validating invitation..." />
      </div>
    );
  }

  if (!token || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardBody className="flex flex-col items-center gap-4 py-12 px-6">
            <div className="p-4 rounded-full bg-danger/10">
              <Icon
                icon="solar:danger-circle-bold-duotone"
                className="w-16 h-16 text-danger"
              />
            </div>
            <h2 className="text-2xl font-bold text-center">Invalid Invitation</h2>
            <p className="text-default-500 text-center max-w-sm">
              This invitation link is invalid, expired, or has already been used.
            </p>
            <Button
              as="a"
              href="/admin/login"
              color="primary"
              className="w-full mt-4"
            >
              Go to Login
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="flex flex-col items-center gap-3 pt-8 pb-0">
          <div className="p-3 rounded-full bg-success/10">
            <Icon
              icon="solar:user-check-bold-duotone"
              className="w-12 h-12 text-success"
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Join OpenMOS Research Team</h1>
            <p className="text-default-500 text-sm mt-1">
              You&apos;ve been invited by <strong>{invitation.inviterName}</strong>
            </p>
          </div>
        </CardHeader>

        <CardBody className="px-6 py-8">
          {/* Role info */}
          <div className="mb-6 p-4 rounded-lg bg-default-100 flex items-center gap-3">
            <Icon
              icon={getRoleIcon(invitation.role as any)}
              className="w-8 h-8 text-primary"
            />
            <div>
              <p className="text-sm text-default-500">Your role</p>
              <p className="font-semibold">{formatRole(invitation.role as any)}</p>
            </div>
          </div>

          {errors.form && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20">
              <div className="flex items-center gap-2 text-danger">
                <Icon icon="solar:danger-circle-bold-duotone" className="w-5 h-5" />
                <span className="text-sm">{errors.form}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-lg bg-default-50">
              <p className="text-xs text-default-400 mb-1">Email (cannot be changed)</p>
              <p className="font-medium">{invitation.email}</p>
            </div>

            <Input
              label="Full Name"
              placeholder="Dr. Jane Smith"
              value={formData.fullName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fullName: e.target.value }))
              }
              isInvalid={!!errors.fullName}
              errorMessage={errors.fullName}
              startContent={
                <Icon
                  icon="solar:user-linear"
                  className="w-5 h-5 text-default-400"
                />
              }
            />

            <div>
              <Input
                label="Create Password"
                placeholder="Create a strong password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                isInvalid={!!errors.password}
                errorMessage={errors.password}
                startContent={
                  <Icon
                    icon="solar:lock-password-linear"
                    className="w-5 h-5 text-default-400"
                  />
                }
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    <Icon
                      icon={showPassword ? "solar:eye-closed-linear" : "solar:eye-linear"}
                      className="w-5 h-5 text-default-400 hover:text-default-600 transition-colors"
                    />
                  </button>
                }
                autoComplete="new-password"
              />

              {formData.password && (
                <div className="mt-2">
                  <Progress
                    value={getStrengthValue()}
                    color={getStrengthColor()}
                    size="sm"
                    className="max-w-full"
                  />
                  <p className={`text-xs mt-1 text-${getStrengthColor()}`}>
                    Password strength: {passwordStrength.strength}
                  </p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              color="primary"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              isDisabled={passwordStrength.strength !== "strong"}
            >
              Accept & Join Team
            </Button>
          </form>

          <div className="relative my-6">
            <Divider />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-content1 px-4 text-sm text-default-400">
              OR
            </span>
          </div>

          <div className="space-y-3">
            <Button
              variant="bordered"
              className="w-full"
              onPress={() => handleOAuthClick("Google")}
              startContent={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              }
            >
              Continue with Google
            </Button>

            <Button
              variant="bordered"
              className="w-full"
              onPress={() => handleOAuthClick("GitHub")}
              startContent={<Icon icon="mdi:github" className="w-5 h-5" />}
            >
              Continue with GitHub
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Coming Soon Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalContent>
          <ModalHeader className="flex flex-col items-center gap-2 pt-6">
            <div className="p-3 rounded-full bg-warning/10">
              <Icon
                icon="solar:clock-circle-bold-duotone"
                className="w-10 h-10 text-warning"
              />
            </div>
            <h3 className="text-xl font-semibold">Coming Soon!</h3>
          </ModalHeader>
          <ModalBody className="text-center pb-2">
            <p className="text-default-600">
              {comingSoonProvider} authentication is currently under development
              and will be available soon.
            </p>
            <p className="text-sm text-default-400 mt-2">
              Please use the password option above to create your account.
            </p>
          </ModalBody>
          <ModalFooter className="justify-center pb-6">
            <Button color="primary" onPress={onClose}>
              Got it
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <Spinner size="lg" label="Loading..." />
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
