import { getDatabase } from "../database";

const expenseCategories = [
  "Food",
  "Groceries",
  "Transport",
  "Fuel",
  "Shopping",
  "Bills",
  "Entertainment",
  "Healthcare",
  "Education",
  "Travel",
  "Subscriptions",
  "Others",
];

const incomeCategories = [
  "Salary",
  "Freelance",
  "Interest",
  "Gift",
  "Investment",
  "Others",
];

export async function seedDatabase() {
  const db = await getDatabase();

  const accountCount = await db.getFirstAsync<{
    count: number;
  }>("SELECT COUNT(*) as count FROM accounts");

  if (!accountCount || accountCount.count === 0) {
    const now = new Date().toISOString();

    await db.runAsync(
      `
      INSERT INTO accounts
      (
        name,
        type,
        currency,
        opening_balance,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      ["Cash", "cash", "INR", 0, now, now]
    );
  }

  const defaultAccount = await db.getFirstAsync<{
    id: number;
  }>(
    `
    SELECT id
    FROM accounts
    WHERE name = ?
    LIMIT 1
    `,
    ["Cash"]
  );

  if (!defaultAccount) {
    throw new Error("Default Cash account was not created");
  }

  const defaultSettings = [
    ["theme", "light"],
    ["defaultTransactionType", "expense"],
    ["defaultAccountId", String(defaultAccount.id)],
    ["currency", "INR"],
    ["dateFormat", "dd/mm/yyyy"],
    ["confirmTransactionDelete", "1"],
    ["budgetDate", new Date().toISOString()],
    ["defaultBudgetCycle", "monthly"],
    ["totalBudget", "0"],
  ];

  for (const [key, value] of defaultSettings) {
    await db.runAsync(
      `
      INSERT OR IGNORE INTO settings (key, value)
      VALUES (?, ?)
      `,
      [key, value]
    );
  }

  const categoryCount = await db.getFirstAsync<{
    count: number;
  }>("SELECT COUNT(*) as count FROM categories");

  if (!categoryCount || categoryCount.count === 0) {
    const now = new Date().toISOString();

    for (const category of expenseCategories) {
      await db.runAsync(
        `
        INSERT INTO categories
        (
            name,
            type,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?)
        `,
        [category, "expense", now, now]
      );
    }

    for (const category of incomeCategories) {
      await db.runAsync(
        `
        INSERT INTO categories
        (
            name,
            type,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?)
        `,
        [category, "income", now, now]
      );
    }
  }
}
