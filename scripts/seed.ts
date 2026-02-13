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
import { adminUsers, aiModels, languages } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/utils";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Seed default AI models
  console.log("🌱 Seeding AI models...\n");
  const defaultModels = [
    { name: "Orpheus", value: "orpheus", description: "Standard TTS model" },
    { name: "NeMo", value: "nemo", description: "Nvidia NeMo TTS" },
    {
      name: "Ground Truth",
      value: "ground_truth",
      description: "Human recorded audio",
    },
  ];

  for (const model of defaultModels) {
    await db.insert(aiModels).values(model).onConflictDoNothing().returning();
  }

  console.log("✅ Seeded default AI models\n");

  // Seed default Languages
  console.log("🌱 Seeding Languages...\n");
  const defaultLanguages = [
    {
      code: "luganda",
      name: "Luganda",
      flag: "🇺🇬",
      region: "Uganda",
      speakers: "10M+",
    },
    {
      code: "krio",
      name: "Krio",
      flag: "🇸🇱",
      region: "Sierra Leone",
      speakers: "6M+",
    },
  ];

  for (const lang of defaultLanguages) {
    await db.insert(languages).values(lang).onConflictDoNothing().returning();
  }
  console.log("✅ Seeded default Languages\n");

  // Check if owner already exists
  const existingOwner = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.role, "owner"))
    .limit(1);

  if (existingOwner.length > 0) {
    console.log("✅ Owner already exists:", existingOwner[0].email);
    console.log("   Skipping owner creation.\n");
    process.exit(0);
  }

  // Create the first admin user (owner)
  const ownerPassword = process.env.ADMIN_PASSWORD || "OpenMOS@2024!";
  const passwordHash = await hashPassword(ownerPassword);

  const [owner] = await db
    .insert(adminUsers)
    .values({
      username: "admin",
      email: "admin@openmos.org",
      passwordHash,
      fullName: "OpenMOS Admin",
      role: "owner",
      isActive: true,
      emailVerified: true,
    })
    .returning();

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
