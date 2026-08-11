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