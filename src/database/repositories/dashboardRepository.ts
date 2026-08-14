import { BaseRepository } from "./baseRepository";
import { Transaction } from "@/features/transactions/types/transaction";
import { Category } from "@/features/categories/types/category";

export interface MonthlyCategorySpending {
  id: number;
  name: string;
  icon: string | null;
  amount: number;
  percentage: number;
}

export interface MonthlyFinancialData {
  monthlySpending: number;
  previousMonthSpending: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  topCategories: MonthlyCategorySpending[];
  recentTransactions: (Transaction & { categoryName: string; categoryIcon: string | null })[];
}

class DashboardRepository extends BaseRepository {
  /**
   * Get transactions for a specific month
   */
  private async getTransactionsByMonth(year: number, month: number) {
    try {
      const db = await this.db();

      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      return db.getAllAsync<Transaction>(
        `
        SELECT *
        FROM transactions
        WHERE deleted_at IS NULL
          AND transaction_date >= ?
          AND transaction_date <= ?
        ORDER BY transaction_date DESC, id DESC;
        `,
        [startDate, endDate]
      );
    } catch (error) {
      this.handleError("Get transactions by month", error);
      return [];
    }
  }

  /**
   * Get top 5 spending categories for current month
   */
  async getTopSpendingCategories(limit = 5) {
    try {
      const db = await this.db();
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const categories = await db.getAllAsync<any>(
        `
        SELECT 
          c.id,
          c.name,
          c.icon,
          SUM(t.amount) as amount
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.deleted_at IS NULL
          AND t.type = 'expense'
          AND t.transaction_date >= ?
          AND t.transaction_date <= ?
        GROUP BY c.id
        ORDER BY amount DESC
        LIMIT ?;
        `,
        [startDate, endDate, limit]
      );

      // Calculate total spending to get percentages
      const totalSpending = categories.reduce((sum: number, cat: any) => sum + cat.amount, 0);

      return categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        amount: cat.amount,
        percentage: totalSpending > 0 ? Math.round((cat.amount / totalSpending) * 100) : 0,
      }));
    } catch (error) {
      this.handleError("Get top spending categories", error);
      return [];
    }
  }

  /**
   * Get recent transactions (5 latest) with category info
   */
  async getRecentTransactionsWithCategories(limit = 5) {
    try {
      const db = await this.db();

      return db.getAllAsync<any>(
        `
        SELECT 
          t.*,
          c.name as categoryName,
          c.icon as categoryIcon
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.deleted_at IS NULL
        ORDER BY t.transaction_date DESC, t.id DESC
        LIMIT ?;
        `,
        [limit]
      );
    } catch (error) {
      this.handleError("Get recent transactions with categories", error);
      return [];
    }
  }

  /**
   * Get monthly financial summary (income, expenses, spending change)
   */
  async getMonthlyFinancialSummary() {
    try {
      const db = await this.db();
      const now = new Date();

      // Current month
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // Previous month
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

      const currentMonth = await db.getFirstAsync<any>(
        `
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
        FROM transactions
        WHERE deleted_at IS NULL
          AND transaction_date >= ?
          AND transaction_date <= ?;
        `,
        [currentMonthStart, currentMonthEnd]
      );

      const previousMonth = await db.getFirstAsync<any>(
        `
        SELECT 
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
        FROM transactions
        WHERE deleted_at IS NULL
          AND transaction_date >= ?
          AND transaction_date <= ?;
        `,
        [previousMonthStart, previousMonthEnd]
      );

      const monthlyIncome = currentMonth?.income || 0;
      const monthlyExpenses = currentMonth?.expenses || 0;
      const previousMonthExpenses = previousMonth?.expenses || 0;

      // Calculate percentage change
      let changePercentage = 0;
      if (previousMonthExpenses > 0) {
        changePercentage = ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;
      }

      return {
        monthlySpending: monthlyExpenses,
        monthlyIncome,
        monthlyExpenses,
        previousMonthSpending: previousMonthExpenses,
        changePercentage: Math.round(changePercentage * 10) / 10,
        isIncrease: changePercentage > 0,
      };
    } catch (error) {
      this.handleError("Get monthly financial summary", error);
      return {
        monthlySpending: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        previousMonthSpending: 0,
        changePercentage: 0,
        isIncrease: false,
      };
    }
  }

  /**
   * Get all dashboard data in one call
   */
  async getDashboardData() {
    try {
      const [financialSummary, topCategories, recentTransactions] = await Promise.all([
        this.getMonthlyFinancialSummary(),
        this.getTopSpendingCategories(5),
        this.getRecentTransactionsWithCategories(5),
      ]);

      return {
        financialSummary,
        topCategories,
        recentTransactions,
      };
    } catch (error) {
      this.handleError("Get dashboard data", error);
      return {
        financialSummary: {
          monthlySpending: 0,
          monthlyIncome: 0,
          monthlyExpenses: 0,
          previousMonthSpending: 0,
          changePercentage: 0,
          isIncrease: false,
        },
        topCategories: [],
        recentTransactions: [],
      };
    }
  }
}

export default new DashboardRepository();
