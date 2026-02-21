import type { SendEmailOptions } from "./types";

import { transporter, DEFAULT_FROM, DEFAULT_REPLY_TO } from "./email-config";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/**
 * Send an email via Nodemailer with retry logic (exponential backoff).
 */
export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
}> {
  const { to, subject, html, text, replyTo, attachments } = options;

  const recipients = Array.isArray(to) ? to.join(", ") : to;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: DEFAULT_FROM,
        to: recipients,
        subject,
        html,
        text,
        replyTo: replyTo || DEFAULT_REPLY_TO,
        attachments: attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
        })),
      });

      console.log(
        `📧 Email sent: "${subject}" → ${recipients} (${info.messageId})`,
      );

      return { success: true, messageId: info.messageId };
    } catch (error) {
      lastError = error as Error;

      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);

        console.warn(
          `⚠️  Email attempt ${attempt}/${MAX_RETRIES} failed: ${lastError.message}. Retrying in ${delay}ms…`,
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  console.error(
    `❌ Email failed after ${MAX_RETRIES} attempts: ${lastError?.message}`,
  );
  throw lastError;
}
