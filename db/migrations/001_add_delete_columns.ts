import type { SQLiteDatabase } from "expo-sqlite";

export async function migrate(db: SQLiteDatabase) {
  // Add deleted_at to accounts if it doesn't exist
  const accountsInfo = await db.getAllAsync<{
    name: string;
  }>(`PRAGMA table_info(accounts);`);

  if (!accountsInfo.some((c) => c.name === "deleted_at")) {
    await db.execAsync(`ALTER TABLE accounts ADD COLUMN deleted_at TEXT;`);
  }

  // Add deleted_at to categories if it doesn't exist
  const categoriesInfo = await db.getAllAsync<{
    name: string;
  }>(`PRAGMA table_info(categories);`);

  if (!categoriesInfo.some((c) => c.name === "deleted_at")) {
    await db.execAsync(`ALTER TABLE categories ADD COLUMN deleted_at TEXT;`);
  }
}