"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { addToast } from "@heroui/toast";

type AuthView = "login" | "forgot-password" | "signup";

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  callbackUrl?: string;
}

export function AuthModal({
  isOpen,
  onSuccess,
  callbackUrl = "/admin",
}: AuthModalProps) {
  const [currentView, setCurrentView] = useState<AuthView>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Signup state
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  });
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [signupSubmitted, setSignupSubmitted] = useState(false);

  // Reset all forms when switching views
  const switchView = (view: AuthView) => {
    setCurrentView(view);
    setLoginErrors({});
    setForgotError("");
    setResetSent(false);
    setSignupErrors({});
    setSignupSubmitted(false);
  };

  // Handle login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});

    if (!loginData.usernameOrEmail) {
      setLoginErrors((prev) => ({
        ...prev,
        usernameOrEmail: "Username or email is required",
      }));

      return;
    }
    if (!loginData.password) {
      setLoginErrors((prev) => ({ ...prev, password: "Password is required" }));

      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        usernameOrEmail: loginData.usernameOrEmail,
        password: loginData.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        let displayError = result.error;

        if (displayError === "CredentialsSignin") {
          displayError =
            "Invalid username or password, or your account may be locked.";
        } else if (displayError === "Configuration") {
          displayError =
            "There is a server configuration issue. Please contact support.";
        } else if (displayError === "AccessDenied") {
          displayError = "Access denied. Your account may be deactivated.";
        }

        setLoginErrors({ form: displayError });
        addToast({
          title: "Login Failed",
          description: displayError,
          color: "danger",
        });
        setIsLoading(false);
      } else if (result?.ok) {
        addToast({
          title: "Welcome back!",
          description: "Successfully logged in",
          color: "success",
        });
        onSuccess();
      }
    } catch {
      setLoginErrors({ form: "An unexpected error occurred" });
      setIsLoading(false);
    }
  };

  // Handle forgot password submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");

    if (!forgotEmail) {
      setForgotError("Email address is required");

      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotError("Please enter a valid email address");

      return;
    }

    setIsLoading(true);

    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      // Always show success to prevent email enumeration
      setResetSent(true);
      addToast({
        title: "Email Sent",
        description: "Check your inbox for reset instructions",
        color: "success",
      });
    } catch {
      setResetSent(true); // Still show success for security
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});

    if (!signupData.name.trim()) {
      setSignupErrors((prev) => ({ ...prev, name: "Name is required" }));

      return;
    }
    if (!signupData.email.trim()) {
      setSignupErrors((prev) => ({ ...prev, email: "Email is required" }));

      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      setSignupErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email",
      }));

      return;
    }
    if (!signupData.username.trim()) {
      setSignupErrors((prev) => ({
        ...prev,
        username: "Username is required",
      }));

      return;
    }
    if (!signupData.password.trim()) {
      setSignupErrors((prev) => ({
        ...prev,
        password: "Password is required",
      }));

      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (!response.ok) {
        setSignupErrors({ form: data.error || "Failed to create account" });
        addToast({
          title: "Signup Failed",
          description: data.error || "Failed to create account",
          color: "danger",
        });

        return;
      }

      setSignupSubmitted(true);
      addToast({
        title: "Account Created!",
        description: "Check your email to verify your account",
        color: "success",
      });
    } catch {
      setSignupErrors({ form: "Failed to create account. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Render Login View
  const renderLoginView = () => (
    <>
      <CardHeader className="flex flex-col items-center gap-3 pt-8 pb-0">
        <div className="p-3 rounded-full bg-primary/10">
          <Icon
            className="w-12 h-12 text-primary"
            icon="solar:shield-check-bold-duotone"
          />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">OpenMOS Admin Portal</h1>
          <p className="text-default-500 text-sm mt-1">
            Sign in to access the dashboard
          </p>
        </div>
      </CardHeader>

      <CardBody className="px-6 py-8">
        {loginErrors.form && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20">
            <div className="flex items-center gap-2 text-danger">
              <Icon
                className="w-5 h-5"
                icon="solar:danger-circle-bold-duotone"
              />
              <span className="text-sm">{loginErrors.form}</span>
            </div>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <Input
            autoComplete="username"
            errorMessage={loginErrors.usernameOrEmail}
            isDisabled={isLoading}
            isInvalid={!!loginErrors.usernameOrEmail}
            label="Username or Email"
            placeholder="Enter your username or email"
            startContent={
              <Icon
                className="w-5 h-5 text-default-400"
                icon="solar:user-linear"
              />
            }
            type="text"
            value={loginData.usernameOrEmail}
            onChange={(e) =>
              setLoginData((prev) => ({
                ...prev,
                usernameOrEmail: e.target.value,
              }))
            }
          />

          <Input
            autoComplete="current-password"
            endContent={
              <button
                className="focus:outline-none"
                disabled={isLoading}
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
            errorMessage={loginErrors.password}
            isDisabled={isLoading}
            isInvalid={!!loginErrors.password}
            label="Password"
            placeholder="Enter your password"
            startContent={
              <Icon
                className="w-5 h-5 text-default-400"
                icon="solar:lock-password-linear"
              />
            }
            type={showPassword ? "text" : "password"}
            value={loginData.password}
            onChange={(e) =>
              setLoginData((prev) => ({ ...prev, password: e.target.value }))
            }
          />

          <div className="flex items-center justify-between">
            <Checkbox
              isDisabled={isLoading}
              isSelected={rememberMe}
              size="sm"
              onValueChange={setRememberMe}
            >
              <span className="text-sm">Remember me</span>
            </Checkbox>
            <button
              className="text-sm text-default-500 hover:text-primary transition-colors"
              type="button"
              onClick={() => switchView("forgot-password")}
            >
              Forgot password?
            </button>
          </div>

          <Button
            className="w-full"
            color="primary"
            isLoading={isLoading}
            size="lg"
            startContent={
              !isLoading && (
                <Icon className="w-5 h-5" icon="solar:login-bold-duotone" />
              )
            }
            type="submit"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-default-500">
            Don&apos;t have access?{" "}
            <button
              className="text-primary hover:underline"
              type="button"
              onClick={() => switchView("signup")}
            >
              Sign Up
            </button>
          </p>
        </div>
      </CardBody>
    </>
  );

  // Render Forgot Password View
  const renderForgotPasswordView = () => (
    <>
      <CardHeader className="flex flex-col items-center gap-3 pt-8 pb-0">
        <div className="p-3 rounded-full bg-primary/10">
          <Icon
            className="w-12 h-12 text-primary"
            icon="solar:lock-unlocked-bold-duotone"
          />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Reset Your Password</h1>
          <p className="text-default-500 text-sm mt-1 max-w-xs">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>
      </CardHeader>

      <CardBody className="px-6 py-8">
        {resetSent ? (
          <div className="text-center space-y-4">
            <div className="p-4 rounded-full bg-success/10 w-fit mx-auto">
              <Icon
                className="w-16 h-16 text-success"
                icon="solar:check-circle-bold-duotone"
              />
            </div>
            <h2 className="text-xl font-bold">Check Your Email</h2>
            <p className="text-default-500">
              If an account exists with <strong>{forgotEmail}</strong>,
              you&apos;ll receive a reset link shortly.
            </p>
            <p className="text-sm text-default-400">
              The link will expire in 1 hour.
            </p>
            <div className="flex flex-col gap-2 pt-4">
              <Button
                className="w-full"
                color="primary"
                onPress={() => switchView("login")}
              >
                Back to Login
              </Button>
              <Button
                className="w-full"
                variant="light"
                onPress={() => {
                  setResetSent(false);
                  setForgotEmail("");
                }}
              >
                Try a different email
              </Button>
            </div>
          </div>
        ) : (
          <>
            {forgotError && (
              <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20">
                <div className="flex items-center gap-2 text-danger">
                  <Icon
                    className="w-5 h-5"
                    icon="solar:danger-circle-bold-duotone"
                  />
                  <span className="text-sm">{forgotError}</span>
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleForgotPassword}>
              <Input
                autoComplete="email"
                isDisabled={isLoading}
                label="Email Address"
                placeholder="researcher@university.edu"
                startContent={
                  <Icon
                    className="w-5 h-5 text-default-400"
                    icon="solar:letter-linear"
                  />
                }
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />

              <Button
                className="w-full"
                color="primary"
                isLoading={isLoading}
                size="lg"
                type="submit"
              >
                Send Reset Link
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                className="text-sm text-default-500 hover:text-primary inline-flex items-center gap-1 transition-colors"
                type="button"
                onClick={() => switchView("login")}
              >
                <Icon className="w-4 h-4" icon="solar:alt-arrow-left-linear" />
                Back to Login
              </button>
            </div>
          </>
        )}
      </CardBody>
    </>
  );

  // Render Signup View
  const renderSignupView = () => (
    <>
      <CardHeader className="flex flex-col items-center gap-3 pt-8 pb-0">
        <div className="p-3 rounded-full bg-primary/10">
          <Icon
            className="w-12 h-12 text-primary"
            icon="solar:user-plus-bold-duotone"
          />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-default-500 text-sm mt-1 max-w-xs">
            Sign up as a researcher to access OpenMOS
          </p>
        </div>
      </CardHeader>

      <CardBody className="px-6 py-8">
        {signupSubmitted ? (
          <div className="text-center space-y-4">
            <div className="p-4 rounded-full bg-success/10 w-fit mx-auto">
              <Icon
                className="w-16 h-16 text-success"
                icon="solar:check-circle-bold-duotone"
              />
            </div>
            <h2 className="text-xl font-bold">Check Your Email</h2>
            <p className="text-default-500">
              We&apos;ve sent a verification link to{" "}
              <strong>{signupData.email}</strong>.
            </p>
            <p className="text-sm text-default-400">
              Click the link in the email to activate your account.
            </p>
            <Button
              className="w-full mt-4"
              color="primary"
              onPress={() => switchView("login")}
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <>
            {signupErrors.form && (
              <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20">
                <div className="flex items-center gap-2 text-danger">
                  <Icon
                    className="w-5 h-5"
                    icon="solar:danger-circle-bold-duotone"
                  />
                  <span className="text-sm">{signupErrors.form}</span>
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSignup}>
              <Input
                autoComplete="name"
                errorMessage={signupErrors.name}
                isDisabled={isLoading}
                isInvalid={!!signupErrors.name}
                label="Full Name"
                placeholder="Dr. Jane Smith"
                startContent={
                  <Icon
                    className="w-5 h-5 text-default-400"
                    icon="solar:user-linear"
                  />
                }
                value={signupData.name}
                onChange={(e) =>
                  setSignupData((prev) => ({ ...prev, name: e.target.value }))
                }
              />

              <Input
                autoComplete="email"
                errorMessage={signupErrors.email}
                isDisabled={isLoading}
                isInvalid={!!signupErrors.email}
                label="Email Address"
                placeholder="researcher@university.edu"
                startContent={
                  <Icon
                    className="w-5 h-5 text-default-400"
                    icon="solar:letter-linear"
                  />
                }
                type="email"
                value={signupData.email}
                onChange={(e) =>
                  setSignupData((prev) => ({ ...prev, email: e.target.value }))
                }
              />

              <Input
                autoComplete="username"
                errorMessage={signupErrors.username}
                isDisabled={isLoading}
                isInvalid={!!signupErrors.username}
                label="Username"
                placeholder="janesmith"
                startContent={
                  <Icon
                    className="w-5 h-5 text-default-400"
                    icon="solar:user-id-linear"
                  />
                }
                value={signupData.username}
                onChange={(e) =>
                  setSignupData((prev) => ({
                    ...prev,
                    username: e.target.value.toLowerCase(),
                  }))
                }
              />

              <Input
                autoComplete="new-password"
                endContent={
                  <button
                    className="focus:outline-none"
                    disabled={isLoading}
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
                errorMessage={signupErrors.password}
                isDisabled={isLoading}
                isInvalid={!!signupErrors.password}
                label="Password"
                placeholder="Create a strong password"
                startContent={
                  <Icon
                    className="w-5 h-5 text-default-400"
                    icon="solar:lock-password-linear"
                  />
                }
                type={showPassword ? "text" : "password"}
                value={signupData.password}
                onChange={(e) =>
                  setSignupData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />

              <Button
                className="w-full"
                color="primary"
                isLoading={isLoading}
                size="lg"
                type="submit"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                className="text-sm text-default-500 hover:text-primary inline-flex items-center gap-1 transition-colors"
                type="button"
                onClick={() => switchView("login")}
              >
                <Icon className="w-4 h-4" icon="solar:alt-arrow-left-linear" />
                Back to Login
              </button>
            </div>
          </>
        )}
      </CardBody>
    </>
  );

  return (
    <>
      {/* Main Auth Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop with blur */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        {/* Auth Card */}
        <Card className="relative w-full max-w-md mx-4 shadow-2xl border border-default-200 dark:border-default-100 max-h-[90vh] overflow-y-auto">
          {currentView === "login" && renderLoginView()}
          {currentView === "forgot-password" && renderForgotPasswordView()}
          {currentView === "signup" && renderSignupView()}
        </Card>
      </div>
    </>
  );
}
