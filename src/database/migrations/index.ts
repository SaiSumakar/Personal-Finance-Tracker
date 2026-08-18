import { getDatabase } from "../database";

import { migrate as migratev1 } from "./000_initial_schema";
import { seedDatabase } from "../seeds/defaultCategories";

const DATABASE_VERSION = 1;

export async function migrateDatabase() {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");

  const currentVersion = result?.user_version ?? 0;

  console.log("Current DB version:", currentVersion);

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  await db.execAsync("BEGIN");

  try {
    await migratev1(db);
    await seedDatabase();

    await db.execAsync(`
      PRAGMA user_version = ${DATABASE_VERSION};
    `);

    await db.execAsync("COMMIT");

    console.log("Database initialized successfully");
  } catch (error) {
    await db.execAsync("ROLLBACK");
    console.error("Database migration failed:", error);
    throw error;
  }
}