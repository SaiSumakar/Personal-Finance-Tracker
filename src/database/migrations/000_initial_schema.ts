// import { getDatabase } from "../database";
// import type { SQLiteDatabase } from "expo-sqlite";

// import {
//   CREATE_ACCOUNTS_TABLE,
//   CREATE_CATEGORIES_TABLE,
//   CREATE_TRANSACTIONS_TABLE,
//   CREATE_SETTINGS_TABLE,
//   CREATE_INDEXES,
// } from "../schema";

// const DATABASE_VERSION = 1;

// export async function migrate(db: SQLiteDatabase) {
//   const db = await getDatabase();

//   const result = await db.getFirstAsync<{
//     user_version: number;
//   }>("PRAGMA user_version");

//   const currentVersion = result?.user_version ?? 0;

//   if (currentVersion >= DATABASE_VERSION) {
//     return;
//   }

//   await db.execAsync("BEGIN");

//   try {
//     await db.execAsync(CREATE_ACCOUNTS_TABLE);

//     await db.execAsync(CREATE_CATEGORIES_TABLE);

//     await db.execAsync(CREATE_TRANSACTIONS_TABLE);

//     await db.execAsync(CREATE_SETTINGS_TABLE);

//     await db.execAsync(CREATE_INDEXES);

//     await db.execAsync(`
//         PRAGMA user_version = ${DATABASE_VERSION};
//     `);

//     await db.execAsync("COMMIT");

//     await seedDatabase();
//   } catch (error) {
//     await db.execAsync("ROLLBACK");
//     throw error;
//   }
// }


import type { SQLiteDatabase } from "expo-sqlite";

export async function migrate(db: SQLiteDatabase) {
  await db.execAsync(CREATE_ACCOUNTS_TABLE);

  await db.execAsync(CREATE_CATEGORIES_TABLE);

  await db.execAsync(CREATE_TRANSACTIONS_TABLE);

  await db.execAsync(CREATE_SETTINGS_TABLE);

  await db.execAsync(CREATE_PROFILE_TABLE);

  await db.execAsync(CREATE_DEFAULT_PROFILE);

  await db.execAsync(CREATE_INDEXES);
}

export const CREATE_ACCOUNTS_TABLE = `
CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    type TEXT NOT NULL,

    currency TEXT NOT NULL DEFAULT 'INR',

    opening_balance INTEGER NOT NULL DEFAULT 0,

    color TEXT,

    icon TEXT,

    is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),

    created_at TEXT NOT NULL,

    updated_at TEXT NOT NULL,
    
    deleted_at TEXT,

    UNIQUE(name)
);
`;

export const CREATE_CATEGORIES_TABLE = `
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),

    icon TEXT,

    color TEXT,

    parent_id INTEGER,

    is_default INTEGER NOT NULL DEFAULT 1 CHECK (is_default IN (0, 1)),

    is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),

    created_at TEXT NOT NULL,

    updated_at TEXT NOT NULL,
    
    deleted_at TEXT,

    FOREIGN KEY(parent_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    UNIQUE(name, type)
);
`;

export const CREATE_TRANSACTIONS_TABLE = `
CREATE TABLE IF NOT EXISTS transactions (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    account_id INTEGER NOT NULL,

    category_id INTEGER NOT NULL,

    type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),

    amount INTEGER NOT NULL,

    note TEXT,

    transaction_date TEXT NOT NULL,

    payment_method TEXT,

    location TEXT,

    created_at TEXT NOT NULL,

    updated_at TEXT NOT NULL,

    deleted_at TEXT,

    FOREIGN KEY(account_id)
        REFERENCES accounts(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    FOREIGN KEY(category_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);
`;

export const CREATE_SETTINGS_TABLE = `
CREATE TABLE IF NOT EXISTS settings (

    key TEXT PRIMARY KEY,

    value TEXT
);
`;

export const CREATE_PROFILE_TABLE = `
CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),

    preferred_name TEXT NOT NULL DEFAULT '',

    picture_uri TEXT,

    created_at TEXT NOT NULL,

    updated_at TEXT NOT NULL
);
`;

export const CREATE_DEFAULT_PROFILE = `
INSERT OR IGNORE INTO profile (
    id,
    preferred_name,
    picture_uri,
    created_at,
    updated_at
)
VALUES (
    1,
    '',
    NULL,
    datetime('now'),
    datetime('now')
);
`;

export const CREATE_METADATA_TABLE = `
CREATE TABLE IF NOT EXISTS metadata (

    key TEXT PRIMARY KEY,

    value TEXT
);
`;

export const CREATE_INDEXES = `

CREATE INDEX IF NOT EXISTS idx_transactions_date
ON transactions(transaction_date);

CREATE INDEX IF NOT EXISTS idx_transactions_account
ON transactions(account_id);

CREATE INDEX IF NOT EXISTS idx_transactions_category
ON transactions(category_id);

CREATE INDEX IF NOT EXISTS idx_transactions_type
ON transactions(type);

CREATE INDEX IF NOT EXISTS idx_categories_parent
ON categories(parent_id);

`;
