import type { SQLiteDatabase } from "expo-sqlite";

export async function migrate(db: SQLiteDatabase) {
  const accountsInfo = await db.getAllAsync<{
    name: string;
  }>(`PRAGMA table_info(accounts);`);

  if (!accountsInfo.some((c) => c.name === "current_balance")) {
    await db.execAsync(`
      ALTER TABLE accounts
      ADD COLUMN current_balance REAL NOT NULL DEFAULT 0;
    `);
  }
}
