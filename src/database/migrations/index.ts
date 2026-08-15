import { getDatabase } from "../database";

import { migrate as migratev1 } from "./000_initial_schema"
import { migrate as migratev2 } from "./001_add_delete_columns"
import { migrate as migratev3 } from "./002_add_profile"

import { seedDatabase } from "../seeds/defaultCategories";

// latest
const DATABASE_VERSION = 3.1;

export async function migrateDatabase() {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");

  
  const currentVersion = result?.user_version ?? 0;
  
  console.log("current db version", currentVersion, DATABASE_VERSION);
  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  await db.execAsync("BEGIN");

  try {
    if (currentVersion < 1) {
      await migratev1(db);
      // Seed only when creating schema for the first time
      await seedDatabase();
    }

    if (currentVersion < 2) {
      await migratev2(db);
    }

    if (currentVersion < 3.1) {
      await migratev3(db);
    }
    await db.execAsync(`
      PRAGMA user_version = ${DATABASE_VERSION};
    `);
    await db.execAsync("COMMIT");
  } catch (error) {
    await db.execAsync("ROLLBACK");
    throw error;
  }
}
