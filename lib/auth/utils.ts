import { hash, compare } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import type { AdminRole } from "@/lib/db/schema";

// Password hashing
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

// Session token generation
export function generateSessionToken(): string {
  return uuidv4();
}

// Reset token generation (URL-safe)
export function generateResetToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Invitation token generation
export function generateInviteToken(): string {
  return generateResetToken();
}

// Device fingerprinting (privacy-preserving)
export function generateDeviceFingerprint(request: Request): string {
  const userAgent = request.headers.get("user-agent") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";

  // Create a simple hash from available headers
  const data = `${userAgent}|${acceptLanguage}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Session expiry calculation
export function getSessionExpiry(days: number = 7): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}

// Admin session expiry (8 hours)
export function getAdminSessionExpiry(hours: number = 8): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
}

// Reset token expiry (1 hour)
export function getResetTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1);
  return expiry;
}

// Invite token expiry (7 days)
export function getInviteTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return expiry;
}

// Password validation
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
}

export function validatePassword(
  password: string,
  username?: string,
  email?: string
): PasswordValidationResult {
  const errors: string[] = [];

  // Length check
  if (password.length < 12) {
    errors.push("Password must be at least 12 characters");
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  // Number check
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // Username/email check
  if (username && password.toLowerCase().includes(username.toLowerCase())) {
    errors.push("Password cannot contain your username");
  }
  if (email && password.toLowerCase().includes(email.split("@")[0].toLowerCase())) {
    errors.push("Password cannot contain part of your email");
  }

  // Calculate strength
  let strength: "weak" | "medium" | "strong" = "weak";
  if (errors.length === 0) {
    strength = "strong";
  } else if (errors.length <= 2 && password.length >= 8) {
    strength = "medium";
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

// Role hierarchy
const ROLE_HIERARCHY: AdminRole[] = ["viewer", "researcher", "admin", "owner"];

export function hasPermission(
  userRole: AdminRole,
  requiredRole: AdminRole
): boolean {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);
  return userLevel >= requiredLevel;
}

// Permission matrix
export const PERMISSIONS = {
  owner: {
    viewDashboard: true,
    viewRatings: true,
    exportData: true,
    uploadSamples: true,
    deleteSamples: true,
    manageUsers: true,
    viewAuditLogs: true,
    modifySettings: true,
  },
  admin: {
    viewDashboard: true,
    viewRatings: true,
    exportData: true,
    uploadSamples: true,
    deleteSamples: true,
    manageUsers: false,
    viewAuditLogs: true,
    modifySettings: false,
  },
  researcher: {
    viewDashboard: true,
    viewRatings: true,
    exportData: true,
    uploadSamples: true,
    deleteSamples: false,
    manageUsers: false,
    viewAuditLogs: false,
    modifySettings: false,
  },
  viewer: {
    viewDashboard: true,
    viewRatings: true,
    exportData: false,
    uploadSamples: false,
    deleteSamples: false,
    manageUsers: false,
    viewAuditLogs: false,
    modifySettings: false,
  },
} as const;

export type Permission = keyof (typeof PERMISSIONS)["owner"];

export function canPerform(role: AdminRole, permission: Permission): boolean {
  return PERMISSIONS[role][permission];
}

// Account lockout
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 30;

export function isAccountLocked(lockedUntil: Date | null): boolean {
  if (!lockedUntil) return false;
  return new Date() < lockedUntil;
}

export function getLockoutExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + LOCKOUT_DURATION_MINUTES);
  return expiry;
}

// IP address extraction
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

// Generate backup codes for 2FA
export async function generateBackupCodes(): Promise<{
  codes: string[];
  hashes: string[];
}> {
  const codes: string[] = [];
  const hashes: string[] = [];

  for (let i = 0; i < 10; i++) {
    // Generate 8-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
    hashes.push(await hash(code, 10));
  }

  return { codes, hashes };
}

// Format role for display
export function formatRole(role: AdminRole): string {
  const labels: Record<AdminRole, string> = {
    owner: "Owner",
    admin: "Admin",
    researcher: "Researcher",
    viewer: "Viewer",
  };
  return labels[role];
}

// Get role icon
export function getRoleIcon(role: AdminRole): string {
  const icons: Record<AdminRole, string> = {
    owner: "solar:crown-bold-duotone",
    admin: "solar:shield-check-bold-duotone",
    researcher: "solar:flask-bold-duotone",
    viewer: "solar:eye-bold-duotone",
  };
  return icons[role];
}

// Get role color (HeroUI color prop)
export function getRoleColor(
  role: AdminRole
): "primary" | "secondary" | "success" | "default" {
  const colors: Record<
    AdminRole,
    "primary" | "secondary" | "success" | "default"
  > = {
    owner: "primary",
    admin: "secondary",
    researcher: "success",
    viewer: "default",
  };
  return colors[role];
}
