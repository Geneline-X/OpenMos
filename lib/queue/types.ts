// ============================================
// JOB DATA TYPES
// ============================================

// Email Jobs
export type EmailJobType =
  | "password-reset"
  | "invitation"
  | "welcome"
  | "access-request"
  | "evaluation-complete";

export interface EmailJobData {
  type: EmailJobType;
  to: string;
  subject?: string;
  data: Record<string, unknown>;
}

// Evaluation Jobs
export type EvaluationJobType =
  | "process-rating"
  | "calculate-mos"
  | "aggregate-results"
  | "finalize-session";

export interface EvaluationJobData {
  type: EvaluationJobType;
  sessionId?: string;
  sampleId?: string;
  ratingId?: string;
  data?: Record<string, unknown>;
}

// Audit Jobs
export type AuditAction =
  | "login"
  | "logout"
  | "login_failed"
  | "password_reset"
  | "user_created"
  | "user_updated"
  | "user_deleted"
  | "settings_changed"
  | "sample_uploaded"
  | "sample_deleted"
  | "export_data";

export interface AuditJobData {
  action: AuditAction;
  userId?: string;
  targetId?: string;
  targetType?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Cleanup Jobs
export type CleanupJobType =
  | "expire-sessions"
  | "expire-reset-tokens"
  | "expire-invitations"
  | "archive-evaluations"
  | "cleanup-temp-files";

export interface CleanupJobData {
  type: CleanupJobType;
  olderThan?: Date;
}

// Report Jobs
export type ReportJobType =
  | "export-evaluations"
  | "generate-statistics"
  | "sample-analysis"
  | "user-activity";

export interface ReportJobData {
  type: ReportJobType;
  requestedBy: string;
  filters?: {
    startDate?: Date;
    endDate?: Date;
    language?: string;
    modelType?: string;
  };
  format?: "csv" | "json" | "pdf";
}
