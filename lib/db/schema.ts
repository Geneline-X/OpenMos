import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  decimal,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Cookie consent preferences type
export type CookieConsent = {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  research: boolean;
};

// User roles for admin access
export type AdminRole = "owner" | "admin" | "researcher" | "viewer";

// Session status types
export type SessionStatus = "active" | "completed" | "expired" | "abandoned";

// Raters table - stores participant demographics and session info
export const raters = pgTable("raters", {
  id: uuid("id").primaryKey().defaultRandom(),
  age: integer("age"),
  gender: text("gender"), // 'male' | 'female' | 'non-binary' | 'prefer_not_to_say'
  nativeLanguage: text("native_language").notNull(), // 'luganda' | 'krio'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sessionToken: uuid("session_token").defaultRandom(),
  cookieConsent: jsonb("cookie_consent").$type<CookieConsent>(),
  ipHash: text("ip_hash"), // Anonymized for duplicate detection
});

// Native speaker sessions - anonymous session-based auth
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    raterId: uuid("rater_id").references(() => raters.id),
    sessionToken: text("session_token").unique().notNull(),
    deviceFingerprint: text("device_fingerprint"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    lastActivity: timestamp("last_activity").defaultNow().notNull(),
    status: text("status").$type<SessionStatus>().default("active").notNull(),
    completedAt: timestamp("completed_at"),
    currentSampleIndex: integer("current_sample_index").default(0).notNull(),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
  },
  (table) => [
    index("idx_sessions_token").on(table.sessionToken),
    index("idx_sessions_rater").on(table.raterId),
    index("idx_sessions_expires").on(table.expiresAt),
  ],
);

// Audio samples table - stores uploaded audio files
export const audioSamples = pgTable("audio_samples", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileUrl: text("file_url").notNull(), // UploadThing CDN URL
  uploadthingKey: text("uploadthing_key"), // For deletion capability
  modelType: text("model_type").notNull(),
  language: text("language").notNull(),
  textContent: text("text_content"), // Optional transcript
  durationSeconds: decimal("duration_seconds", { precision: 6, scale: 2 }),
  fileSizeBytes: integer("file_size_bytes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  uploadedBy: uuid("uploaded_by").references(() => adminUsers.id),
  // Samples belong to exactly one study. Deleting a study cascades here,
  // which then cascades to ratings (see ratings.audioId below).
  studyId: uuid("study_id").references(() => studies.id, {
    onDelete: "cascade",
  }),
});

// Evaluation sessions table - tracks user evaluation progress
export const evaluationSessions = pgTable("evaluation_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  raterId: uuid("rater_id")
    .references(() => raters.id)
    .notNull(),
  // SET NULL so historical sessions survive study deletion
  studyId: uuid("study_id").references(() => studies.id, {
    onDelete: "set null",
  }),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  totalSamples: integer("total_samples").default(20).notNull(),
  completedCount: integer("completed_count").default(0).notNull(),
  currentSampleIndex: integer("current_sample_index").default(0).notNull(),
  deviceType: text("device_type"),
  browserType: text("browser_type"),
});

// Ratings table - stores individual audio ratings
export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .references(() => evaluationSessions.id)
    .notNull(),
  raterId: uuid("rater_id")
    .references(() => raters.id)
    .notNull(),
  // CASCADE: deleting a sample removes its ratings automatically
  audioId: uuid("audio_id")
    .references(() => audioSamples.id, { onDelete: "cascade" })
    .notNull(),
  score: integer("score").notNull(), // 1-5
  timeToRateMs: integer("time_to_rate_ms"), // Time from play to rating
  playbackCount: integer("playback_count").default(1), // How many times replayed
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userAgent: text("user_agent"),
});

// Admin users table - enhanced auth for admin dashboard
export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    username: text("username").unique().notNull(),
    email: text("email").unique().notNull(),
    passwordHash: text("password_hash"), // NULL if OAuth-only account
    fullName: text("full_name"),
    role: text("role").$type<AdminRole>().default("researcher").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),

    // Security
    failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
    lockedUntil: timestamp("locked_until"),
    twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
    twoFactorSecret: text("two_factor_secret"), // Encrypted TOTP secret

    // OAuth
    oauthProvider: text("oauth_provider"), // 'google', 'github', NULL
    oauthId: text("oauth_id"), // Provider-specific user ID

    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    createdBy: uuid("created_by"),
    lastLogin: timestamp("last_login"),
    lastActivity: timestamp("last_activity"),

    // Preferences
    preferences: jsonb("preferences"),
  },
  (table) => [
    index("idx_admin_users_email").on(table.email),
    index("idx_admin_users_username").on(table.username),
  ],
);

// Password reset tokens
export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminId: uuid("admin_id")
      .references(() => adminUsers.id, { onDelete: "cascade" })
      .notNull(),
    token: text("token").unique().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_reset_tokens_token").on(table.token),
    index("idx_reset_tokens_expires").on(table.expiresAt),
  ],
);

// Email verification tokens
export const emailVerificationTokens = pgTable(
  "email_verification_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminId: uuid("admin_id")
      .references(() => adminUsers.id, { onDelete: "cascade" })
      .notNull(),
    token: text("token").unique().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_verification_tokens_token").on(table.token),
    index("idx_verification_tokens_expires").on(table.expiresAt),
  ],
);

// Admin invitations

export const adminInvitations = pgTable(
  "admin_invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    invitedBy: uuid("invited_by").references(() => adminUsers.id),
    role: text("role").$type<AdminRole>().notNull(),
    token: text("token").unique().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_invitations_token").on(table.token),
    index("idx_invitations_email").on(table.email),
  ],
);

// Audit action types
export type AuditAction =
  | "login_success"
  | "login_failed"
  | "logout"
  | "export_data"
  | "upload_sample"
  | "delete_sample"
  | "create_user"
  | "update_user"
  | "delete_user"
  | "change_permissions"
  | "enable_2fa"
  | "disable_2fa"
  | "password_reset_request"
  | "password_reset_complete";

// Audit logs
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminId: uuid("admin_id").references(() => adminUsers.id),
    action: text("action").$type<AuditAction>().notNull(),
    resourceType: text("resource_type"),
    resourceId: uuid("resource_id"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => [
    index("idx_audit_logs_admin").on(table.adminId),
    index("idx_audit_logs_action").on(table.action),
    index("idx_audit_logs_timestamp").on(table.timestamp),
  ],
);

// Backup codes for 2FA
export const backupCodes = pgTable(
  "backup_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminId: uuid("admin_id")
      .references(() => adminUsers.id, { onDelete: "cascade" })
      .notNull(),
    codeHash: text("code_hash").notNull(), // bcrypt hash of code
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_backup_codes_admin").on(table.adminId)],
);

// Export logs table - tracks data exports
export const exportLogs = pgTable("export_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id").references(() => adminUsers.id),
  exportType: text("export_type").notNull(), // 'csv' | 'json' | 'xlsx'
  uploadthingUrl: text("uploadthing_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  recordCount: integer("record_count"),
});

// Notification types
export type NotificationType =
  | "rater_started"
  | "rater_completed"
  | "samples_uploaded"
  | "rating_milestone"
  | "export_completed"
  | "system";

// Notifications table - stores admin notifications
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => adminUsers.id, {
      onDelete: "cascade",
    }),
    type: text("type").$type<NotificationType>().notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    metadata: jsonb("metadata"), // Extra data like rater ID, sample count, etc.
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_notifications_read").on(table.isRead),
    index("idx_notifications_created").on(table.createdAt),
  ],
);

// Access request status types
export type AccessRequestStatus = "pending" | "approved" | "rejected";

// Access requests table - stores researcher access requests
export const accessRequests = pgTable(
  "access_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    institution: text("institution").notNull(),
    reason: text("reason").notNull(),
    status: text("status")
      .$type<AccessRequestStatus>()
      .default("pending")
      .notNull(),
    reviewedBy: uuid("reviewed_by").references(() => adminUsers.id),
    reviewedAt: timestamp("reviewed_at"),
    reviewNotes: text("review_notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_access_requests_email").on(table.email),
    index("idx_access_requests_status").on(table.status),
  ],
);

// AI Models - Dynamic list of models
export const aiModels = pgTable(
  "ai_models",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(), // e.g., "NeMo"
    value: text("value").notNull(), // e.g., "nemo"
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    userId: uuid("user_id").references(() => adminUsers.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_ai_models_value_user").on(table.value, table.userId),
  ],
);

// Languages - Dynamic list of languages
export const languages = pgTable(
  "languages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(), // e.g., "luganda" - duplicate codes allowed if different users
    name: text("name").notNull(), // e.g., "Luganda"
    flag: text("flag").notNull(), // e.g., "🇺🇬"
    region: text("region"),
    speakers: text("speakers"),
    isActive: boolean("is_active").default(true).notNull(),
    userId: uuid("user_id").references(() => adminUsers.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // Unique code per user
    uniqueIndex("idx_languages_code_user").on(table.code, table.userId),
    // We can't easily enforce "unique code where userId is null" with standard drizzle-orm pg-core distinct from "unique code per user" without partial indexes or check constraints which might be complex here.
    // Instead, we'll rely on app logic or a partial index if we were writing raw SQL.
    // For now, let's relax the strict unique constraint on 'code' globally,
    // and rely on the unique index on (code, userId) for user-specific ones.
    // Ideally we'd have `CREATE UNIQUE INDEX ... WHERE user_id IS NULL` but Drizzle supports `.where()`
    uniqueIndex("idx_languages_code_global")
      .on(table.code)
      .where(sql`user_id IS NULL`),
  ],
);

// User Model Preferences - Junction table for user-specific model preferences
export const userModelPreferences = pgTable(
  "user_model_preferences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => adminUsers.id, { onDelete: "cascade" })
      .notNull(),
    modelId: uuid("model_id")
      .references(() => aiModels.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_user_model_prefs_user").on(table.userId),
    index("idx_user_model_prefs_model").on(table.modelId),
    uniqueIndex("idx_user_model_unique").on(table.userId, table.modelId),
  ],
);

// User Language Preferences - Junction table for user-specific language preferences
export const userLanguagePreferences = pgTable(
  "user_language_preferences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => adminUsers.id, { onDelete: "cascade" })
      .notNull(),
    languageId: uuid("language_id")
      .references(() => languages.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_user_lang_prefs_user").on(table.userId),
    index("idx_user_lang_prefs_lang").on(table.languageId),
    uniqueIndex("idx_user_lang_unique").on(table.userId, table.languageId),
  ],
);

// Studies - Configuration for data collection

export const studies = pgTable("studies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  accessKey: text("access_key")
    .unique()
    .notNull()
    .default(sql`'MOS-' || upper(substr(md5(random()::text), 1, 6))`),
  isActive: boolean("is_active").default(false).notNull(),
  userId: uuid("user_id").references(() => adminUsers.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Study Models - Many-to-Many relation between Studies and AI Models
export const studyModels = pgTable(
  "study_models",
  {
    studyId: uuid("study_id")
      .references(() => studies.id, { onDelete: "cascade" })
      .notNull(),
    modelId: uuid("model_id")
      .references(() => aiModels.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    { pk: [table.studyId, table.modelId] }, // Composite primary key
  ],
);

// Study Languages - Many-to-Many relation between Studies and Languages
export const studyLanguages = pgTable(
  "study_languages",
  {
    studyId: uuid("study_id")
      .references(() => studies.id, { onDelete: "cascade" })
      .notNull(),
    languageId: uuid("language_id")
      .references(() => languages.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    { pk: [table.studyId, table.languageId] }, // Composite primary key
  ],
);

// Type exports for use in application
export type Rater = typeof raters.$inferSelect;
export type NewRater = typeof raters.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type AudioSample = typeof audioSamples.$inferSelect;
export type NewAudioSample = typeof audioSamples.$inferInsert;
export type EvaluationSession = typeof evaluationSessions.$inferSelect;
export type NewEvaluationSession = typeof evaluationSessions.$inferInsert;
export type Rating = typeof ratings.$inferSelect;
export type NewRating = typeof ratings.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type AdminInvitation = typeof adminInvitations.$inferSelect;
export type NewAdminInvitation = typeof adminInvitations.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type BackupCode = typeof backupCodes.$inferSelect;
export type NewBackupCode = typeof backupCodes.$inferInsert;
export type ExportLog = typeof exportLogs.$inferSelect;
export type NewExportLog = typeof exportLogs.$inferInsert;
export type AccessRequest = typeof accessRequests.$inferSelect;
export type NewAccessRequest = typeof accessRequests.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type AiModel = typeof aiModels.$inferSelect;
export type NewAiModel = typeof aiModels.$inferInsert;
export type Language = typeof languages.$inferSelect;
export type NewLanguage = typeof languages.$inferInsert;
export type Study = typeof studies.$inferSelect;
export type NewStudy = typeof studies.$inferInsert;
export type StudyModel = typeof studyModels.$inferSelect;
export type NewStudyModel = typeof studyModels.$inferInsert;
export type StudyLanguage = typeof studyLanguages.$inferSelect;
export type NewStudyLanguage = typeof studyLanguages.$inferInsert;

export type UserModelPreference = typeof userModelPreferences.$inferSelect;
export type NewUserModelPreference = typeof userModelPreferences.$inferInsert;
export type UserLanguagePreference =
  typeof userLanguagePreferences.$inferSelect;
export type NewUserLanguagePreference =
  typeof userLanguagePreferences.$inferInsert;

export type EmailVerificationToken =
  typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationToken =
  typeof emailVerificationTokens.$inferInsert;
