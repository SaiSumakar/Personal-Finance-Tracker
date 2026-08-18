import type { SQLiteDatabase } from "expo-sqlite";

export async function migrate(
  db: SQLiteDatabase
) {
  await db.execAsync(`
    CREATE TABLE transactions_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      from_account_id INTEGER,

      to_account_id INTEGER,

      category_id INTEGER,

      type TEXT NOT NULL
        CHECK (
          type IN (
            'expense',
            'income',
            'transfer'
          )
        ),

      amount INTEGER NOT NULL,

      note TEXT,

      transaction_date TEXT NOT NULL,

      payment_method TEXT,

      location TEXT,

      created_at TEXT NOT NULL,

      updated_at TEXT NOT NULL,

      deleted_at TEXT,

      FOREIGN KEY(from_account_id)
        REFERENCES accounts(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

      FOREIGN KEY(to_account_id)
        REFERENCES accounts(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

      FOREIGN KEY(category_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

      CHECK (
        (
          type = 'income'
          AND from_account_id IS NULL
          AND to_account_id IS NOT NULL
          AND category_id IS NOT NULL
        )
        OR
        (
          type = 'expense'
          AND from_account_id IS NOT NULL
          AND to_account_id IS NULL
          AND category_id IS NOT NULL
        )
        OR
        (
          type = 'transfer'
          AND from_account_id IS NOT NULL
          AND to_account_id IS NOT NULL
          AND from_account_id != to_account_id
          AND category_id IS NULL
        )
      )
    );

    INSERT INTO transactions_new (
      id,
      from_account_id,
      to_account_id,
      category_id,
      type,
      amount,
      note,
      transaction_date,
      payment_method,
      location,
      created_at,
      updated_at,
      deleted_at
    )
    SELECT
      id,

      CASE
        WHEN type = 'expense'
          THEN account_id
        ELSE from_account_id
      END,

      CASE
        WHEN type = 'income'
          THEN account_id
        ELSE to_account_id
      END,

      category_id,
      type,
      amount,
      note,
      transaction_date,
      payment_method,
      location,
      created_at,
      updated_at,
      deleted_at
    FROM transactions;

    DROP TABLE transactions;

    ALTER TABLE transactions_new
    RENAME TO transactions;

    CREATE INDEX IF NOT EXISTS idx_transactions_date
    ON transactions(transaction_date);

    CREATE INDEX IF NOT EXISTS idx_transactions_from_account
    ON transactions(from_account_id);

    CREATE INDEX IF NOT EXISTS idx_transactions_to_account
    ON transactions(to_account_id);

    CREATE INDEX IF NOT EXISTS idx_transactions_category
    ON transactions(category_id);

    CREATE INDEX IF NOT EXISTS idx_transactions_type
    ON transactions(type);
  `);
}