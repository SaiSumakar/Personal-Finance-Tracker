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