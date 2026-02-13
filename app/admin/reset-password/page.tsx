"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Link } from "@heroui/link";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";

import { validatePassword } from "@/lib/auth/utils";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<{
    strength: "weak" | "medium" | "strong";
    errors: string[];
  }>({ strength: "weak", errors: [] });

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false);

        return;
      }

      try {
        const response = await fetch("/api/auth/validate-reset-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.valid) {
          setIsValid(true);
          setEmail(data.email);
        }
      } catch (err) {
        console.error("Token validation error:", err);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // Password strength check
  useEffect(() => {
    if (formData.password) {
      const result = validatePassword(formData.password, undefined, email);

      setPasswordStrength({
        strength: result.strength,
        errors: result.errors,
      });
    } else {
      setPasswordStrength({ strength: "weak", errors: [] });
    }
  }, [formData.password, email]);

  // Countdown and redirect after success
  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);

      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      router.push("/admin/login");
    }
  }, [isSuccess, countdown, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate password
    const validation = validatePassword(formData.password, undefined, email);

    if (!validation.isValid) {
      setErrors({ password: validation.errors[0] });

      return;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });

      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setIsSuccess(true);
      addToast({
        title: "Password Reset",
        description: "Your password has been successfully reset",
        color: "success",
      });
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Failed to reset password",
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

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Spinner label="Validating reset link..." size="lg" />
      </div>
    );
  }

  // Invalid token
  if (!token || !isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardBody className="flex flex-col items-center gap-4 py-12 px-6">
            <div className="p-4 rounded-full bg-danger/10">
              <Icon
                className="w-16 h-16 text-danger"
                icon="solar:danger-circle-bold-duotone"
              />
            </div>
            <h2 className="text-2xl font-bold text-center">
              Invalid Reset Link
            </h2>
            <p className="text-default-500 text-center max-w-sm">
              This password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <div className="flex flex-col gap-2 w-full mt-4">
              <Button
                as={Link}
                className="w-full"
                color="primary"
                href="/admin/forgot-password"
              >
                Request New Link
              </Button>
              <Button
                as={Link}
                className="w-full"
                href="/admin/login"
                variant="light"
              >
                Back to Login
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardBody className="flex flex-col items-center gap-4 py-12 px-6">
            <div className="p-4 rounded-full bg-success/10">
              <Icon
                className="w-16 h-16 text-success"
                icon="solar:check-circle-bold-duotone"
              />
            </div>
            <h2 className="text-2xl font-bold text-center">
              Password Reset Successful
            </h2>
            <p className="text-default-500 text-center max-w-sm">
              You can now log in with your new password.
            </p>
            <Button
              as={Link}
              className="w-full mt-4"
              color="primary"
              href="/admin/login"
              size="lg"
              startContent={
                <Icon className="w-5 h-5" icon="solar:login-bold-duotone" />
              }
            >
              Go to Login
            </Button>
            <p className="text-sm text-default-400">
              Redirecting in {countdown} seconds...
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="flex flex-col items-center gap-3 pt-8 pb-0">
          <div className="p-3 rounded-full bg-primary/10">
            <Icon
              className="w-12 h-12 text-primary"
              icon="solar:shield-check-bold-duotone"
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Create New Password</h1>
            <p className="text-default-500 text-sm mt-1">
              For: <strong>{email}</strong>
            </p>
          </div>
        </CardHeader>

        <CardBody className="px-6 py-8">
          {errors.form && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20">
              <div className="flex items-center gap-2 text-danger">
                <Icon
                  className="w-5 h-5"
                  icon="solar:danger-circle-bold-duotone"
                />
                <span className="text-sm">{errors.form}</span>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Input
                autoComplete="new-password"
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon
                      className="w-5 h-5 text-default-400 hover:text-default-600 transition-colors"
                      icon={
                        showPassword
                          ? "solar:eye-closed-linear"
                          : "solar:eye-linear"
                      }
                    />
                  </button>
                }
                errorMessage={errors.password}
                isInvalid={!!errors.password}
                label="New Password"
                placeholder="Create a strong password"
                startContent={
                  <Icon
                    className="w-5 h-5 text-default-400"
                    icon="solar:lock-password-linear"
                  />
                }
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
              />

              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-500">Password Strength:</span>
                    <span
                      className={`font-medium capitalize text-${getStrengthColor()}`}
                    >
                      {passwordStrength.strength}
                    </span>
                  </div>
                  <Progress
                    className="max-w-full"
                    color={getStrengthColor()}
                    size="sm"
                    value={getStrengthValue()}
                  />
                  <ul className="space-y-1 mt-2">
                    {[
                      {
                        check: formData.password.length >= 12,
                        text: "At least 12 characters",
                      },
                      {
                        check: /[A-Z]/.test(formData.password),
                        text: "Contains uppercase letter",
                      },
                      {
                        check: /[a-z]/.test(formData.password),
                        text: "Contains lowercase letter",
                      },
                      {
                        check: /\d/.test(formData.password),
                        text: "Contains number",
                      },
                      {
                        check: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                          formData.password,
                        ),
                        text: "Contains special character",
                      },
                    ].map((item, i) => (
                      <li
                        key={i}
                        className={`flex items-center gap-2 text-xs ${
                          item.check ? "text-success" : "text-default-400"
                        }`}
                      >
                        <Icon
                          className="w-4 h-4"
                          icon={
                            item.check
                              ? "solar:check-circle-bold"
                              : "solar:close-circle-linear"
                          }
                        />
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Input
              autoComplete="new-password"
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Icon
                    className="w-5 h-5 text-default-400 hover:text-default-600 transition-colors"
                    icon={
                      showConfirmPassword
                        ? "solar:eye-closed-linear"
                        : "solar:eye-linear"
                    }
                  />
                </button>
              }
              errorMessage={errors.confirmPassword}
              isInvalid={!!errors.confirmPassword}
              label="Confirm Password"
              placeholder="Confirm your password"
              startContent={
                <Icon
                  className="w-5 h-5 text-default-400"
                  icon="solar:lock-password-linear"
                />
              }
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
            />

            <Button
              className="w-full"
              color="primary"
              isDisabled={passwordStrength.strength !== "strong"}
              isLoading={isLoading}
              size="lg"
              type="submit"
            >
              Reset Password
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <Spinner label="Loading..." size="lg" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
