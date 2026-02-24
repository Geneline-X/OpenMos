import React from "react";

import { renderEmail } from "../../emails/lib/render-email";
import { sendEmail } from "../../emails/lib/send-email";

// Import the specific React Email templates
import { VerifyEmail } from "../../emails/templates/researcher/VerifyEmail";
import { PasswordReset } from "../../emails/templates/researcher/PasswordReset";

/**
 * Send email verification link to new users
 */
const getAppUrl = () => {
  if (
    process.env.NEXT_PUBLIC_APP_URL &&
    process.env.NEXT_PUBLIC_APP_URL !== "http://localhost:3000"
  ) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationToken: string,
) {
  const appUrl = getAppUrl();
  const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;

  try {
    const { html, text } = await renderEmail(
      React.createElement(VerifyEmail, {
        userName: name,
        verificationUrl,
        appUrl,
      }),
    );

    const result = await sendEmail({
      to: email,
      subject: "Verify your OpenMOS account",
      html,
      text,
    });

    return result;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string,
) {
  const appUrl = getAppUrl();
  const resetUrl = `${appUrl}/admin/reset-password?token=${resetToken}`;

  try {
    const { html, text } = await renderEmail(
      React.createElement(PasswordReset, {
        userName: name,
        resetUrl,
        expiresInMinutes: 60,
        appUrl,
      }),
    );

    const result = await sendEmail({
      to: email,
      subject: "Reset your OpenMOS password",
      html,
      text,
    });

    return result;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
}
