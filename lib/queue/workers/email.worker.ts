import type { EmailJobData } from "../types";

import { Worker, Job } from "bullmq";
import { Resend } from "resend";

import { createConnection } from "../connection";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || "OpenMOS <onboarding@resend.dev>";

// Email templates
const emailTemplates = {
  "password-reset": (data: Record<string, unknown>) => ({
    subject: "Reset Your Password - OpenMOS",
    html: `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${data.resetUrl}">${data.resetUrl}</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  }),

  invitation: (data: Record<string, unknown>) => ({
    subject: "You've Been Invited to OpenMOS",
    html: `
      <h1>Welcome to OpenMOS!</h1>
      <p>${data.inviterName} has invited you to join OpenMOS as a <strong>${data.role}</strong>.</p>
      <p>Click below to accept your invitation:</p>
      <a href="${data.inviteUrl}">${data.inviteUrl}</a>
      <p>This invitation expires in 7 days.</p>
    `,
  }),

  welcome: (data: Record<string, unknown>) => ({
    subject: "Welcome to OpenMOS",
    html: `
      <h1>Welcome, ${data.name}!</h1>
      <p>Your account has been created successfully.</p>
      <p>You can now log in at: <a href="${data.loginUrl}">${data.loginUrl}</a></p>
    `,
  }),

  "access-request": (data: Record<string, unknown>) => ({
    subject: "New Access Request - OpenMOS",
    html: `
      <h1>New Access Request</h1>
      <p><strong>Name:</strong> ${data.requesterName}</p>
      <p><strong>Email:</strong> ${data.requesterEmail}</p>
      <p><strong>Institution:</strong> ${data.institution}</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <p>Review this request in the admin dashboard.</p>
    `,
  }),

  "evaluation-complete": (data: Record<string, unknown>) => ({
    subject: "Thank You for Your Contribution - OpenMOS",
    html: `
      <h1>Thank You!</h1>
      <p>You've completed ${data.totalRatings} evaluations.</p>
      <p>Your contribution helps improve AI voice technology for African languages.</p>
    `,
  }),
};

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "⚠️ RESEND_API_KEY is not set. Emails will be logged but not sent.",
    );
    console.log(`📧 [MOCK EMAIL] To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${html.substring(0, 100)}...`);

    return;
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      throw new Error(error.message);
    }

    console.log(`📧 Email sent via Resend: ${emailData?.id} to ${to}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw error;
  }
}

export function createEmailWorker() {
  const worker = new Worker<EmailJobData>(
    "email",
    async (job: Job<EmailJobData>) => {
      const { type, to, subject, data } = job.data;

      console.log(`📧 Processing email job: ${job.name}`);

      const template = emailTemplates[type];

      if (!template) {
        throw new Error(`Unknown email template: ${type}`);
      }

      const { subject: templateSubject, html } = template(data);

      await sendEmail(to, subject || templateSubject, html);

      return { sent: true, to, type };
    },
    {
      connection: createConnection(),
      concurrency: 5, // Process 5 emails at a time
    },
  );

  worker.on("completed", (job) => {
    console.log(`✅ Email job completed: ${job.name} (${job.id})`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Email job failed: ${job?.name} - ${err.message}`);
  });

  return worker;
}
