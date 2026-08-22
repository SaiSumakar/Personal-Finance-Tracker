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

  console.log(
    `[Database] Current version: ${currentVersion}, Target version: ${DATABASE_VERSION}`
  );

  // Database is already initialized
  if (currentVersion === DATABASE_VERSION) {
    console.log("[Database] Already initialized");
    return;
  }

  // Safety check: database version is newer than the app expects
  if (currentVersion > DATABASE_VERSION) {
    throw new Error(
      `[Database] Database version ${currentVersion} is newer than supported version ${DATABASE_VERSION}`
    );
  }

  await db.execAsync("BEGIN TRANSACTION");

  try {
    // Fresh database
    if (currentVersion === 0) {
      console.log("[Database] Running initial schema migration");

      await migratev1(db);

      // Prefer passing the same DB connection
      await seedDatabase();

      await db.execAsync(`
        PRAGMA user_version = 1;
      `);
    }

    await db.execAsync("COMMIT");

    console.log("[Database] Initialization completed successfully");
  } catch (error) {
    await db.execAsync("ROLLBACK");

    console.error("[Database] Initialization failed:", error);

    throw error;
  }
}