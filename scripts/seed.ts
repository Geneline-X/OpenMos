/**
 * Database Seed Script
 * 
 * Creates the first admin user (owner) for the platform.
 * Run after migrating the database:
 * 
 *   bunx drizzle-kit push
 *   bun run scripts/seed.ts
 */

import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/utils";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Check if owner already exists
  const existingOwner = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.role, "owner"))
    .limit(1);

  if (existingOwner.length > 0) {
    console.log("✅ Owner already exists:", existingOwner[0].email);
    console.log("   Skipping seed.\n");
    process.exit(0);
  }

  // Create the first admin user (owner)
  const ownerPassword = process.env.ADMIN_PASSWORD || "OpenMOS@2024!";
  const passwordHash = await hashPassword(ownerPassword);

  const [owner] = await db.insert(adminUsers).values({
    username: "admin",
    email: "admin@openmos.org",
    passwordHash,
    fullName: "OpenMOS Admin",
    role: "owner",
    isActive: true,
    emailVerified: true,
  }).returning();

  console.log("✅ Created owner account:");
  console.log(`   Username: ${owner.username}`);
  console.log(`   Email: ${owner.email}`);
  console.log(`   Role: ${owner.role}`);
  console.log(`   Password: ${ownerPassword}`);
  console.log("\n⚠️  Change the password after first login!\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
