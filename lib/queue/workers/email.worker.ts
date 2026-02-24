import type { EmailJobData, EmailJobType } from "../types";

import React from "react";
import { Worker, Job } from "bullmq";

import { createConnection } from "../connection";
import { renderEmail } from "../../../emails/lib/render-email";
import { sendEmail } from "../../../emails/lib/send-email";

// Import all templates
import { PasswordReset } from "../../../emails/templates/researcher/PasswordReset";
import { InviteResearcher } from "../../../emails/templates/researcher/InviteResearcher";
import { WelcomeResearcher } from "../../../emails/templates/researcher/WelcomeResearcher";
import { VerifyEmail } from "../../../emails/templates/researcher/VerifyEmail";
import { PasswordChanged } from "../../../emails/templates/researcher/PasswordChanged";
import { DataExportReady } from "../../../emails/templates/researcher/DataExportReady";
import { StudyMilestone } from "../../../emails/templates/researcher/StudyMilestone";
import { DataQualityAlert } from "../../../emails/templates/researcher/DataQualityAlert";
import { WeeklyDigest } from "../../../emails/templates/researcher/WeeklyDigest";
import { TwoFactorCode } from "../../../emails/templates/researcher/TwoFactorCode";
import { ErrorAlert } from "../../../emails/templates/system/ErrorAlert";
import { MaintenanceNotice } from "../../../emails/templates/system/MaintenanceNotice";

// Get app URL for templates. Prefer explicitly set NEXT_PUBLIC_APP_URL if it's not localhost.
// Fallback to Vercel URLs if available, otherwise default to localhost.
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
const appUrl = getAppUrl();

/**
 * Render appropriate React Email template based on job type
 */
async function renderTemplateForJob(type: EmailJobType, data: any) {
  let element: React.ReactElement | null = null;
  let subject = "";

  switch (type) {
    case "password-reset":
      subject = "Reset Your Password - OpenMOS";
      element = React.createElement(PasswordReset, {
        userName: data.userName || "User",
        resetUrl: data.resetUrl,
        expiresInMinutes: 60,
        appUrl,
      });
      break;

    case "invitation":
      subject = "You've Been Invited to OpenMOS";
      element = React.createElement(InviteResearcher, {
        inviterName: data.inviterName,
        inviteeName: data.inviteeName || "Colleague",
        role: data.role,
        acceptUrl: data.inviteUrl,
        expiresInDays: 7,
        appUrl,
      });
      break;

    case "welcome":
      subject = "Welcome to OpenMOS";
      element = React.createElement(WelcomeResearcher, {
        userName: data.name,
        role: data.role || "Researcher",
        dashboardUrl: `${appUrl}/admin`,
        docsUrl: `${appUrl}/docs`,
        appUrl,
      });
      break;

    case "verify-email":
      subject = "Verify your OpenMOS account";
      element = React.createElement(VerifyEmail, {
        userName: data.name,
        verificationUrl: data.verificationUrl,
        appUrl,
      });
      break;

    case "password-changed":
      subject = "Your OpenMOS password was changed";
      element = React.createElement(PasswordChanged, {
        userName: data.userName,
        changedAt: new Date().toLocaleString(),
        ipAddress: data.ipAddress,
        device: data.device,
        supportUrl: `${appUrl}/help`,
        appUrl,
      });
      break;

    case "data-export-ready":
      subject = "Your OpenMOS export is ready";
      element = React.createElement(DataExportReady, {
        researcherName: data.researcherName,
        exportType: data.exportType,
        downloadUrl: data.downloadUrl,
        recordCount: data.recordCount,
        fileSize: data.fileSize,
        expiresInDays: 7,
        appUrl,
      });
      break;

    case "study-milestone":
      subject = `🎉 Milestone reached: ${data.milestone}`;
      element = React.createElement(StudyMilestone, {
        researcherName: data.researcherName,
        studyName: data.studyName,
        milestone: data.milestone,
        totalRatings: data.totalRatings,
        completedSessions: data.completedSessions,
        completionRate: data.completionRate,
        dashboardUrl: `${appUrl}/admin/studies/${data.studyId}`,
        appUrl,
      });
      break;

    case "data-quality-alert":
      subject = `⚠️ Data quality alert for ${data.studyName}`;
      element = React.createElement(DataQualityAlert, {
        researcherName: data.researcherName,
        studyName: data.studyName,
        alertType: data.alertType,
        alertDescription: data.alertDescription,
        affectedCount: data.affectedCount,
        reviewUrl: `${appUrl}/admin/studies/${data.studyId}/review`,
        appUrl,
      });
      break;

    case "weekly-digest":
      subject = "Your weekly OpenMOS summary";
      element = React.createElement(WeeklyDigest, {
        researcherName: data.researcherName,
        weekStart: data.weekStart,
        weekEnd: data.weekEnd,
        newRatings: data.newRatings,
        completionRate: data.completionRate,
        activeStudies: data.activeStudies,
        topInsights: data.topInsights || [],
        dashboardUrl: `${appUrl}/admin`,
        appUrl,
      });
      break;

    case "two-factor-code":
      subject = "Your OpenMOS verification code";
      element = React.createElement(TwoFactorCode, {
        userName: data.userName,
        code: data.code,
        expiresInMinutes: 5,
        appUrl,
      });
      break;

    case "error-alert":
      subject = `🚨 System Error: ${data.errorType}`;
      element = React.createElement(ErrorAlert, {
        errorType: data.errorType,
        errorMessage: data.errorMessage,
        occurredAt: new Date().toLocaleString(),
        affectedService: data.affectedService,
        dashboardUrl: `${appUrl}/admin/system`,
        appUrl,
      });
      break;

    case "maintenance-notice":
      subject = `Scheduled maintenance: ${data.maintenanceStart}`;
      element = React.createElement(MaintenanceNotice, {
        maintenanceStart: data.maintenanceStart,
        maintenanceEnd: data.maintenanceEnd,
        duration: data.duration,
        affectedServices: data.affectedServices || [
          "OpenMOS Admin Portal",
          "Evaluation interface",
        ],
        reason: data.reason,
        appUrl,
      });
      break;

    // Fallbacks for legacy basic templates not converted to React Email yet
    case "access-request":
      subject = "New Access Request - OpenMOS";

      return {
        subject,
        html: `<h1>New Access Request</h1><p>From: ${data.requesterName} (${data.requesterEmail})</p><p>Reason: ${data.reason}</p>`,
        text: `New access request from ${data.requesterName}`,
      };
    case "evaluation-complete":
      subject = "Thank You for Your Contribution - OpenMOS";

      return {
        subject,
        html: `<h1>Thank You!</h1><p>You've completed ${data.totalRatings} evaluations.</p>`,
        text: `Thank you for completing ${data.totalRatings} evaluations.`,
      };

    default:
      throw new Error(`Unknown email job type: ${type}`);
  }

  if (element) {
    const { html, text } = await renderEmail(element);

    return { subject, html, text };
  }

  throw new Error("Failed to render email template");
}

export function createEmailWorker() {
  const worker = new Worker<EmailJobData>(
    "email",
    async (job: Job<EmailJobData>) => {
      const { type, to, subject: overrideSubject, data } = job.data;

      console.log(`📧 Processing email job: ${job.name} (type: ${type})`);

      try {
        const rendered = await renderTemplateForJob(type, data);

        await sendEmail({
          to,
          subject: overrideSubject || rendered.subject,
          html: rendered.html,
          text: rendered.text,
        });

        return { sent: true, to, type };
      } catch (error) {
        console.error(
          `❌ Failed to render/send email for job ${job.name}:`,
          error,
        );
        throw error;
      }
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
