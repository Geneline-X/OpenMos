/**
 * Data Wipe Script
 *
 * Deletes all evaluation / research data while preserving every admin
 * user account (credentials, invitations, 2FA backup codes).
 *
 * Step 1 — removes files from UploadThing CDN so you are not billed
 *           for orphaned storage after the DB rows are gone.
 * Step 2 — truncates all non-user tables with CASCADE so FK order
 *           does not matter.
 *
 * Run:
 *   npx tsx scripts/wipe-data.ts
 *   -- or --
 *   bun scripts/wipe-data.ts
 */

import { UTApi } from "uploadthing/server";
import { sql } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../lib/db/schema";

// ── Safety check ────────────────────────────────────────────────────────────
const CONFIRM_ENV = process.env.WIPE_CONFIRMED;

if (CONFIRM_ENV !== "yes") {
  console.error(
    "\n  ⚠  This script permanently deletes ALL evaluation data.\n" +
    "     Re-run with WIPE_CONFIRMED=yes to proceed.\n" +
    "\n     Example:  WIPE_CONFIRMED=yes npx tsx scripts/wipe-data.ts\n",
  );
  process.exit(1);
}

// ── DB connection ────────────────────────────────────────────────────────────
const connection = neon(process.env.DATABASE_URL!);
const db = drizzle(connection, { schema });
const utapi = new UTApi();

async function main() {
  console.log("\n🔍  Collecting UploadThing file keys...");

  // Grab every CDN key before the rows are gone
  const samples = await db
    .select({ key: schema.audioSamples.uploadthingKey })
    .from(schema.audioSamples);

  const utKeys = samples
    .map((s) => s.key)
    .filter((k): k is string => Boolean(k));

  if (utKeys.length > 0) {
    console.log(`🗑   Deleting ${utKeys.length} file(s) from UploadThing CDN...`);

    // UTApi accepts up to 100 keys per call — batch if needed
    const BATCH = 100;

    for (let i = 0; i < utKeys.length; i += BATCH) {
      const batch = utKeys.slice(i, i + BATCH);

      await utapi.deleteFiles(batch);
      console.log(`    ✓ Deleted keys ${i + 1}–${i + batch.length}`);
    }
  } else {
    console.log("   No CDN files found — skipping UploadThing cleanup.");
  }

  console.log("\n🗄   Truncating database tables (preserving user accounts)...");

  // Truncate in dependency order. CASCADE handles any remaining FK refs.
  // Tables explicitly excluded (kept):
  //   admin_users, password_reset_tokens, email_verification_tokens,
  //   admin_invitations, backup_codes
  await db.execute(sql`
    TRUNCATE
      ratings,
      evaluation_sessions,
      sessions,
      audio_samples,
      study_models,
      study_languages,
      studies,
      raters,
      ai_models,
      languages,
      user_model_preferences,
      user_language_preferences,
      notifications,
      export_logs,
      access_requests,
      audit_logs
    RESTART IDENTITY
    CASCADE
  `);

  console.log("   ✓ All tables truncated.\n");
  console.log("✅  Wipe complete. User accounts are untouched.\n");
}

main().catch((err) => {
  console.error("\n❌  Wipe failed:", err);
  process.exit(1);
});
