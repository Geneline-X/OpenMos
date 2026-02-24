import type { AdminRole } from "@/lib/db/schema";

import NextAuth, { CredentialsSignin } from "next-auth";

class CustomAuthError extends CredentialsSignin {
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}

import Credentials from "next-auth/providers/credentials";
import { eq, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminUsers, auditLogs } from "@/lib/db/schema";
import {
  verifyPassword,
  isAccountLocked,
  getLockoutExpiry,
  MAX_LOGIN_ATTEMPTS,
} from "@/lib/auth/utils";

// Extend the default session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      fullName: string | null;
      role: AdminRole;
    };
  }

  interface User {
    id: string;
    username: string;
    email: string;
    fullName: string | null;
    role: AdminRole;
  }
}

declare module "next-auth" {
  interface JWT {
    id: string;
    username: string;
    role: AdminRole;
    fullName: string | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        usernameOrEmail: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.usernameOrEmail || !credentials?.password) {
          throw new CustomAuthError("Missing credentials");
        }

        const usernameOrEmail = credentials.usernameOrEmail as string;
        const password = credentials.password as string;

        // Find user by username or email
        const [user] = await db
          .select()
          .from(adminUsers)
          .where(
            or(
              eq(adminUsers.username, usernameOrEmail.toLowerCase()),
              eq(adminUsers.email, usernameOrEmail.toLowerCase()),
            ),
          )
          .limit(1);

        if (!user) {
          throw new CustomAuthError("Invalid credentials");
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new CustomAuthError(
            "Please verify your email before logging in",
          );
        }

        // Check if account is active
        if (!user.isActive) {
          throw new CustomAuthError("Account has been deactivated");
        }

        // Check if account is locked
        if (isAccountLocked(user.lockedUntil)) {
          const remainingMinutes = Math.ceil(
            (user.lockedUntil!.getTime() - Date.now()) / 60000,
          );

          throw new CustomAuthError(
            `Account locked. Try again in ${remainingMinutes} minutes`,
          );
        }

        // Verify password
        if (!user.passwordHash) {
          throw new CustomAuthError("Please use OAuth to sign in");
        }

        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
          // Increment failed attempts
          const newAttempts = user.failedLoginAttempts + 1;
          const updates: Record<string, unknown> = {
            failedLoginAttempts: newAttempts,
          };

          // Lock account if max attempts reached
          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            updates.lockedUntil = getLockoutExpiry();
          }

          await db
            .update(adminUsers)
            .set(updates)
            .where(eq(adminUsers.id, user.id));

          // Log failed attempt
          await db.insert(auditLogs).values({
            adminId: user.id,
            action: "login_failed",
            ipAddress: null, // Will be set by middleware
            metadata: { reason: "invalid_password", attempts: newAttempts },
          });

          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            throw new CustomAuthError(
              "Too many failed attempts. Account locked for 30 minutes",
            );
          }

          throw new CustomAuthError("Invalid credentials");
        }

        // Reset failed attempts and update last login
        await db
          .update(adminUsers)
          .set({
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLogin: new Date(),
            lastActivity: new Date(),
          })
          .where(eq(adminUsers.id, user.id));

        // Log successful login
        await db.insert(auditLogs).values({
          adminId: user.id,
          action: "login_success",
          ipAddress: null,
        });

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin",
    error: "/admin",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
    updateAge: 60 * 60, // Extend every 1 hour of activity
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.fullName = user.fullName;
      }

      if (trigger === "update" && session && session.fullName !== undefined) {
        token.fullName = session.fullName;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as AdminRole;
        session.user.fullName = token.fullName as string | null;
      }

      return session;
    },
  },
});
