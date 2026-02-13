import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Running manual migration...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "ai_models" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "name" text NOT NULL,
      "value" text UNIQUE NOT NULL,
      "description" text,
      "is_active" boolean DEFAULT true NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);
  console.log("Migration complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
