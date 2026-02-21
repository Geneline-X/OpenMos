"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Suspense } from "react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");

      return;
    }

    // Verify the email
    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage(
            data.message || "Email verified successfully! You can now sign in.",
          );
        } else {
          setStatus("error");
          setMessage(
            data.error || "Email verification failed. Please try again.",
          );
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-default-100">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center gap-3 pt-8 pb-4">
          <div
            className={`p-4 rounded-full ${
              status === "loading"
                ? "bg-primary/10"
                : status === "success"
                  ? "bg-success/10"
                  : "bg-danger/10"
            }`}
          >
            {status === "loading" && (
              <Icon
                className="w-16 h-16 text-primary animate-spin"
                icon="solar:refresh-circle-bold-duotone"
              />
            )}
            {status === "success" && (
              <Icon
                className="w-16 h-16 text-success"
                icon="solar:check-circle-bold-duotone"
              />
            )}
            {status === "error" && (
              <Icon
                className="w-16 h-16 text-danger"
                icon="solar:close-circle-bold-duotone"
              />
            )}
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              {status === "loading"
                ? "Verifying Email..."
                : status === "success"
                  ? "Email Verified!"
                  : "Verification Failed"}
            </h1>
          </div>
        </CardHeader>

        <CardBody className="px-8 pb-8">
          <p className="text-center text-default-600 mb-6">{message}</p>

          {status === "success" && (
            <Button
              className="w-full"
              color="primary"
              size="lg"
              startContent={
                <Icon className="w-5 h-5" icon="solar:login-bold-duotone" />
              }
              onPress={() => router.push("/admin")}
            >
              Go to Login
            </Button>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <Button
                className="w-full"
                color="primary"
                size="lg"
                variant="flat"
                onPress={() => router.push("/admin")}
              >
                Back to Home
              </Button>
              <p className="text-center text-sm text-default-400">
                Need help? Contact support.
              </p>
            </div>
          )}

          {status === "loading" && (
            <div className="flex justify-center">
              <div className="animate-pulse text-default-400">
                Please wait...
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-default-100">
          <div className="animate-pulse text-default-400">Loading...</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
