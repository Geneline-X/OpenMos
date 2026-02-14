import { db } from "../lib/db";
import { adminUsers } from "../lib/db/schema";
import { initializeUserPreferences } from "../app/actions/user-preferences";

async function main() {
  console.log("Starting user preferences migration...");

  try {
    const users = await db.select().from(adminUsers);
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
      console.log(`Processing user: ${user.username} (${user.id})`);
      try {
        await initializeUserPreferences(user.id);
        console.log(`  - Preferences initialized.`);
      } catch (error) {
        // initializeUserPreferences might fail if duplicate keys exist (which is fine, ignore)
        // or other errors. Since we use `insert ... on conflict do nothing` or similar logic?
        // Wait, initializeUserPreferences does check inside?
        // Let's check implementation of initializeUserPreferences again.
        // It does a select then insert. It doesn't use ON CONFLICT DO NOTHING explicitly but
        // the unique index exists. If insert fails due to unique constraint, good.
        // But the function might throw.
        console.error(`  - Failed to initialize:`, error);
      }
    }

    console.log("Migration completed.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
