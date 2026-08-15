import settingsRepository from "@/database/repositories/settingsRepository";
import dashboardRepository from "@/database/repositories/dashboardRepository";
import { DashboardData } from "../types/dashboard";

class DashboardService {
  /**
   * Format date string to short format (e.g., "Aug 12")
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  }

  /**
   * Get all dashboard data in a single organized object
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      const [dashboardRawData, settings] = await Promise.all([
        dashboardRepository.getDashboardData(),
        settingsRepository.getSettings(),
      ]);

      const { financialSummary, topCategories, recentTransactions } = dashboardRawData;
      const totalBudget = settings.totalBudget || 0;
      const spent = financialSummary.monthlyExpenses;
      const remaining = Math.max(0, totalBudget - spent);

      return {
        monthlySpending: {
          amount: financialSummary.monthlySpending,
          change: financialSummary.changePercentage,
          isIncrease: financialSummary.isIncrease,
          topCategory: topCategories.length > 0 ? topCategories[0].name : "No spending",
          topCategoryAmount: topCategories.length > 0 ? topCategories[0].amount : 0,
        },
        budget: {
          totalBudget,
          spent,
          remaining,
        },
        financialSummary: {
          income: financialSummary.monthlyIncome,
          expenses: financialSummary.monthlyExpenses,
          net: financialSummary.monthlyIncome - financialSummary.monthlyExpenses,
        },
        categories: topCategories.map((cat) => ({
          icon: cat.icon,
          label: cat.name,
          amount: cat.amount,
          percentage: cat.percentage,
        })),
        transactions: recentTransactions.map((tx) => ({
          icon: tx.categoryIcon,
          label: tx.categoryName,
          date: this.formatDate(tx.transaction_date),
          amount: tx.type === "expense" ? -tx.amount : tx.amount,
        })),
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Return default empty state
      return {
        monthlySpending: {
          amount: 0,
          change: 0,
          isIncrease: false,
          topCategory: "No spending",
          topCategoryAmount: 0,
        },
        budget: {
          totalBudget: 0,
          spent: 0,
          remaining: 0,
        },
        financialSummary: {
          income: 0,
          expenses: 0,
          net: 0,
        },
        categories: [],
        transactions: [],
      };
    }
  }

  /**
   * Get total budget setting
   */
  async getTotalBudget() {
    const data = await settingsRepository.getSettings();
    return data.totalBudget;
  }
}

export default new DashboardService();