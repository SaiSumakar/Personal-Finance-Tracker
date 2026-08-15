import type { SQLiteDatabase } from "expo-sqlite";

import {
  CREATE_DEFAULT_PROFILE,
  CREATE_PROFILE_TABLE,
} from "./000_initial_schema";

export async function migrate(db: SQLiteDatabase) {
  await db.execAsync(CREATE_PROFILE_TABLE);
  await db.execAsync(CREATE_DEFAULT_PROFILE);
}
