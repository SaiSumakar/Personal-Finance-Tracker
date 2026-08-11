import { getDatabase } from "../database";
import { DatabaseError } from "../errors";
import { SQLiteDatabase } from "expo-sqlite";

export abstract class BaseRepository {
  protected async db() {
    return getDatabase();
  }

  protected async transaction<T>(
    callback: (db: SQLiteDatabase) => Promise<T>
  ): Promise<T> {

      const db = await this.db();

      try {

          await db.execAsync("BEGIN");

          const result = await callback(db);

          await db.execAsync("COMMIT");

          return result;

      } catch (error) {

          await db.execAsync("ROLLBACK");

          this.handleError("Database Transaction", error);
      }
  }

  protected handleError(
    operation: string,
    error: unknown
  ): never {
    console.error(`[Database] ${operation}`, error);

    throw new DatabaseError(
      `Database operation failed: ${operation}`,
      error
    );
  }
}