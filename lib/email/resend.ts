import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set in environment variables");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const SENDER_EMAIL = "onboarding@resend.dev"; // Update this to your verified domain

/**
 * Send email verification link to new users
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationToken: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: email,
      subject: "Verify your OpenMOS account",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 48px 48px 32px; text-align: center; border-bottom: 1px solid #f4f4f5;">
              <div style="width: 48px; height: 48px; background-color: #f4f4f5; border-radius: 50%; display: inline-block; padding: 12px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#0070f3"/>
                </svg>
              </div>
              <h1 style="margin: 16px 0 0; font-size: 20px; font-weight: 600; color: #171717;">OpenMOS Admin Portal</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 48px;">
              <h2 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #171717;">Welcome, ${name}</h2>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #737373;">
                Thanks for signing up for OpenMOS. To complete your registration and access the admin portal, please verify your email address.
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 0 24px;">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.5; color: #a3a3a3;">
                Or copy and paste this URL into your browser:
              </p>
              <p style="margin: 0 0 24px; font-size: 13px; color: #0070f3; word-break: break-all;">
                ${verificationUrl}
              </p>
              
              <div style="padding: 16px; background-color: #fafafa; border-radius: 6px; border-left: 3px solid #0070f3;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #525252;">
                  <strong>This link expires in 1 hour.</strong> If you didn't create an account, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 48px; border-top: 1px solid #f4f4f5;">
              <p style="margin: 0; font-size: 13px; color: #a3a3a3; text-align: center;">
                © ${new Date().getFullYear()} OpenMOS. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Error sending verification email:", error);
      throw new Error(error.message);
    }

    console.log("Verification email sent successfully:", data?.id);

    return { success: true, messageId: data?.id };
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
  resetToken: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: email,
      subject: "Reset your OpenMOS password",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 48px 48px 32px; text-align: center; border-bottom: 1px solid #f4f4f5;">
              <div style="width: 48px; height: 48px; background-color: #fef2f2; border-radius: 50%; display: inline-block; padding: 12px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" fill="#dc2626"/>
                </svg>
              </div>
              <h1 style="margin: 16px 0 0; font-size: 20px; font-weight: 600; color: #171717;">OpenMOS Admin Portal</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 48px;">
              <h2 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #171717;">Password Reset Request</h2>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: #737373;">
                Hi ${name}, we received a request to reset your password. Click the button below to create a new password.
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 0 24px;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.5; color: #a3a3a3;">
                Or copy and paste this URL into your browser:
              </p>
              <p style="margin: 0 0 24px; font-size: 13px; color: #0070f3; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <div style="padding: 16px; background-color: #fef2f2; border-radius: 6px; border-left: 3px solid: #dc2626;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #525252;">
                  <strong>This link expires in 1 hour.</strong> If you didn't request this reset, please ignore this email.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 48px; border-top: 1px solid #f4f4f5;">
              <p style="margin: 0; font-size: 13px; color: #a3a3a3; text-align: center;">
                © ${new Date().getFullYear()} OpenMOS. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      throw new Error(error.message);
    }

    console.log("Password reset email sent successfully:", data?.id);

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
}
