import nodemailer from "nodemailer";

/**
 * Create the Nodemailer transport.
 *
 * Priority order:
 * 1. Explicit SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS env vars
 * 2. Fallback "no-op" transport that logs to console (dev mode)
 */
function createTransport() {
  // 1. Explicit SMTP configuration
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 10, // max 10 messages/second
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
  }

  // 2. No-op: log to console in dev
  console.warn(
    "⚠️  No SMTP configured. Emails will be logged to console only.",
  );

  return nodemailer.createTransport({
    streamTransport: true,
    newline: "unix",
  });
}

export const transporter = createTransport();

/** Default "From" address */
export const DEFAULT_FROM =
  process.env.SMTP_FROM || "OpenMOS <noreply@openmos.app>";

/** Default "Reply-To" address */
export const DEFAULT_REPLY_TO = process.env.SMTP_REPLY_TO || undefined;
