"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Divider } from "@heroui/divider";
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

  // OAuth Coming Soon modal
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonProvider, setComingSoonProvider] = useState("");

  const handleOAuthClick = (provider: string) => {
    setComingSoonProvider(provider);
    setShowComingSoon(true);
  };

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
        setLoginErrors({ form: result.error });
        addToast({
          title: "Login Failed",
          description: result.error,
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

        <div className="relative my-6">
          <Divider />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-content1 px-4 text-sm text-default-400">
            OR
          </span>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full"
            isDisabled={isLoading}
            size="lg"
            startContent={
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            }
            variant="bordered"
            onPress={() => handleOAuthClick("Google")}
          >
            Continue with Google
          </Button>

          <Button
            className="w-full"
            isDisabled={isLoading}
            size="lg"
            startContent={<Icon className="w-5 h-5" icon="mdi:github" />}
            variant="bordered"
            onPress={() => handleOAuthClick("GitHub")}
          >
            Continue with GitHub
          </Button>
        </div>

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

      {/* Coming Soon Modal */}
      <Modal
        isOpen={showComingSoon}
        size="sm"
        onClose={() => setShowComingSoon(false)}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col items-center gap-2 pt-6">
            <div className="p-3 rounded-full bg-warning/10">
              <Icon
                className="w-10 h-10 text-warning"
                icon="solar:clock-circle-bold-duotone"
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
              For now, please use your username and password to sign in.
            </p>
          </ModalBody>
          <ModalFooter className="justify-center pb-6">
            <Button color="primary" onPress={() => setShowComingSoon(false)}>
              Got it
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
