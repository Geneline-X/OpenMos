import { neon } from "@neondatabase/serverless";

// Bun automatically loads .env files

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Migrating database...");

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "languages" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" text NOT NULL UNIQUE,
        "name" text NOT NULL,
        "flag" text NOT NULL,
        "region" text,
        "speakers" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log("Created 'languages' table.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }

  console.log("Migration complete!");
}

main();
