// ============================================
// EMAIL TEMPLATE PROP INTERFACES
// ============================================

/** Base props shared by all templates */
export interface BaseEmailProps {
  /** Absolute URL to the app (e.g. https://openmos.app) */
  appUrl?: string;
}

// ---- Researcher Templates ----

export interface VerifyEmailProps extends BaseEmailProps {
  userName: string;
  verificationUrl: string;
}

export interface WelcomeResearcherProps extends BaseEmailProps {
  userName: string;
  role: string;
  dashboardUrl: string;
  docsUrl: string;
}

export interface InviteResearcherProps extends BaseEmailProps {
  inviterName: string;
  inviteeName: string;
  role: "Admin" | "Researcher" | "Viewer";
  acceptUrl: string;
  expiresInDays: number;
}

export interface PasswordResetProps extends BaseEmailProps {
  userName: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export interface PasswordChangedProps extends BaseEmailProps {
  userName: string;
  changedAt: string;
  ipAddress?: string;
  device?: string;
  supportUrl: string;
}

export interface DataExportReadyProps extends BaseEmailProps {
  researcherName: string;
  exportType: "CSV" | "JSON" | "PDF" | "XLSX";
  downloadUrl: string;
  recordCount: number;
  fileSize: string;
  expiresInDays: number;
}

export interface StudyMilestoneProps extends BaseEmailProps {
  researcherName: string;
  studyName: string;
  milestone: string;
  totalRatings: number;
  completedSessions: number;
  completionRate: number;
  dashboardUrl: string;
}

export interface DataQualityAlertProps extends BaseEmailProps {
  researcherName: string;
  studyName: string;
  alertType: string;
  alertDescription: string;
  affectedCount: number;
  reviewUrl: string;
}

export interface WeeklyDigestProps extends BaseEmailProps {
  researcherName: string;
  weekStart: string;
  weekEnd: string;
  newRatings: number;
  completionRate: number;
  activeStudies: number;
  topInsights: string[];
  dashboardUrl: string;
}

export interface TwoFactorCodeProps extends BaseEmailProps {
  userName: string;
  code: string;
  expiresInMinutes: number;
}

// ---- System Templates ----

export interface ErrorAlertProps extends BaseEmailProps {
  errorType: string;
  errorMessage: string;
  occurredAt: string;
  affectedService: string;
  dashboardUrl: string;
}

export interface MaintenanceNoticeProps extends BaseEmailProps {
  maintenanceStart: string;
  maintenanceEnd: string;
  duration: string;
  affectedServices: string[];
  reason: string;
}

// ---- Send Email Types ----

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}
