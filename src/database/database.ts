import * as SQLite from "expo-sqlite";

let database: SQLite.SQLiteDatabase | null = null;
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) {
    return Promise.resolve(database);
  }

  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync("finance.db")
      .then(async (db) => {
        await db.execAsync(`
          PRAGMA foreign_keys = ON;
        `);

        database = db;
        return db;
      })
      .catch((error) => {
        databasePromise = null;
        throw error;
      });
  }

  return databasePromise;
}
