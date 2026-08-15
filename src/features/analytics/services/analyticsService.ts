import analyticsRepository from "@/database/repositories/analyticsRepository";
import {
  AnalyticsData,
  AnalyticsInsight,
  AnalyticsTimePeriod,
  TrendPoint,
} from "../types/analytics";

type ExpenseTransaction = {
  amount: number;
  transaction_date: string;
  categoryName?: string | null;
};

class AnalyticsService {
  private getPeriodLabel(period: AnalyticsTimePeriod): string {
    switch (period) {
      case "week":
        return "week";
      case "month":
        return "month";
      case "quarter":
        return "quarter";
      case "custom":
        return "custom range";
      default:
        return "period";
    }
  }

  private formatCurrency(value: number): string {
    return `₹${Math.abs(value).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  }

  private buildTrendData(transactions: ExpenseTransaction[], period: AnalyticsTimePeriod): TrendPoint[] {
    const today = new Date();
    const aggregate = new Map<string, number>();

    transactions.forEach((transaction) => {
      const txDate = new Date(transaction.transaction_date);
      let key = "";

      if (period === "week") {
        key = txDate.toLocaleDateString("en-US", { weekday: "short" });
      } else if (period === "month") {
        key = String(txDate.getDate());
      } else if (period === "quarter") {
        key = txDate.toLocaleDateString("en-US", { month: "short" });
      } else {
        key = txDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }

      aggregate.set(key, (aggregate.get(key) ?? 0) + Number(transaction.amount || 0));
    });

    if (period === "week") {
      const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - index));
        return date.toLocaleDateString("en-US", { weekday: "short" });
      });

      return days.map((label) => ({
        label,
        value: aggregate.get(label) ?? 0,
      }));
    }

    if (period === "month") {
      const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

      return Array.from({ length: totalDays }, (_, index) => {
        const day = index + 1;
        return {
          label: String(day),
          value: aggregate.get(String(day)) ?? 0,
        };
      });
    }

    if (period === "quarter") {
      const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
      const monthLabels = Array.from({ length: 3 }, (_, index) => {
        const month = new Date(today.getFullYear(), quarterStartMonth + index, 1);
        return month.toLocaleDateString("en-US", { month: "short" });
      });

      return monthLabels.map((label) => ({
        label,
        value: aggregate.get(label) ?? 0,
      }));
    }

    return Array.from({ length: 30 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (29 - index));

      const label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      return {
        label,
        value: aggregate.get(label) ?? 0,
      };
    });
  }

  private buildInsights(
    transactions: ExpenseTransaction[],
    categories: Array<{ label: string; amount: number }>,
    trendData: TrendPoint[],
    period: AnalyticsTimePeriod
  ): AnalyticsInsight[] {
    const totalSpending = transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
    const largestTransaction = transactions.reduce(
      (max, transaction) => Math.max(max, Number(transaction.amount || 0)),
      0
    );
    const largestTransactionCategory =
      transactions.reduce(
        (largest, transaction) =>
          Number(transaction.amount || 0) > Number(largest.amount || 0) ? transaction : largest,
        transactions[0] ?? { amount: 0, categoryName: "No spending", transaction_date: "" }
      ).categoryName || "No spending";
    const topCategory = categories[0] ?? { label: "No spending", amount: 0 };
    const peakPoint =
      trendData.reduce<TrendPoint | null>((currentPeak, point) => {
        if (!currentPeak || point.value > currentPeak.value) {
          return point;
        }
        return currentPeak;
      }, null) ?? { label: "No spending", value: 0 };

    const avgDailySpending = trendData.length > 0 ? totalSpending / trendData.length : 0;

    return [
      {
        question: "Where is most of my money going?",
        answer: `${topCategory.label} is your largest expense category at ${this.formatCurrency(topCategory.amount)} this ${this.getPeriodLabel(period)}.`,
        accent: "blue",
      },
      {
        question: "What was my biggest expense?",
        answer: `Your largest transaction was ${this.formatCurrency(largestTransaction)} in ${largestTransactionCategory}.`,
        accent: "red",
      },
      {
        question: "When do I spend the most?",
        answer: `Your highest spending point is ${peakPoint.label} with ${this.formatCurrency(peakPoint.value)}.`,
        accent: "amber",
      },
      {
        question: "What is my average daily spending?",
        answer: `Your average daily spend is ${this.formatCurrency(avgDailySpending)} across this ${this.getPeriodLabel(period)}.`,
        accent: "green",
      },
      {
        question: "Which category stands out?",
        answer: `${topCategory.label} accounts for ${topCategory.amount > 0 ? Math.round((topCategory.amount / totalSpending) * 100) : 0}% of your total spending.`,
        accent: "blue",
      },
    ];
  }

  async getAnalyticsData(period: AnalyticsTimePeriod): Promise<AnalyticsData> {
    try {
      const transactions = await analyticsRepository.getTransactionsForPeriod(period);

      if (!transactions.length) {
        return {
          overview: {
            totalSpending: 0,
            transactionCount: 0,
            averageDailySpending: 0,
            largestTransaction: 0,
            largestTransactionCategory: "No spending",
            mostExpensiveCategory: "No spending",
          },
          categories: [],
          trend: {
            week: [],
            month: [],
            quarter: [],
            custom: [],
          },
          insights: [
            {
              question: "Where is most of my money going?",
              answer: "There is no expense data for this period yet.",
              accent: "blue",
            },
            {
              question: "What was my biggest expense?",
              answer: "Add transactions to start seeing your highest spend.",
              accent: "red",
            },
            {
              question: "When do I spend the most?",
              answer: "Spending trends will appear here once you log transactions.",
              accent: "amber",
            },
            {
              question: "What is my average daily spending?",
              answer: "Average spending will show up after your first expense.",
              accent: "green",
            },
            {
              question: "Which category stands out?",
              answer: "Your category breakdown will be generated automatically.",
              accent: "blue",
            },
          ],
        };
      }

      const totalSpending = transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
      const transactionCount = transactions.length;
      const trend = {
        week: this.buildTrendData(transactions, "week"),
        month: this.buildTrendData(transactions, "month"),
        quarter: this.buildTrendData(transactions, "quarter"),
        custom: this.buildTrendData(transactions, "custom"),
      };

      const categoryTotals = new Map<string, number>();
      transactions.forEach((transaction) => {
        const categoryName = transaction.categoryName || "Uncategorized";
        categoryTotals.set(
          categoryName,
          (categoryTotals.get(categoryName) ?? 0) + Number(transaction.amount || 0)
        );
      });

      const categories = Array.from(categoryTotals.entries())
        .map(([label, amount]) => ({
          label,
          amount,
          percentage: totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      const largestTransaction = Math.max(...transactions.map((transaction) => Number(transaction.amount || 0)));
      const largestTransactionCategory =
        transactions.reduce(
          (largest, transaction) =>
            Number(transaction.amount || 0) > Number(largest.amount || 0) ? transaction : largest,
          transactions[0]
        ).categoryName || "No spending";
      const mostExpensiveCategory = categories[0]?.label || "No spending";
      const averageDailySpending = totalSpending / Math.max(1, trend[period].length);

      return {
        overview: {
          totalSpending,
          transactionCount,
          averageDailySpending,
          largestTransaction,
          largestTransactionCategory,
          mostExpensiveCategory,
        },
        categories: categories.map((category) => ({
          label: category.label,
          amount: category.amount,
          percentage: category.percentage,
        })),
        trend,
        insights: this.buildInsights(transactions, categories, trend[period], period),
      };
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      return {
        overview: {
          totalSpending: 0,
          transactionCount: 0,
          averageDailySpending: 0,
          largestTransaction: 0,
          largestTransactionCategory: "No spending",
          mostExpensiveCategory: "No spending",
        },
        categories: [],
        trend: {
          week: [],
          month: [],
          quarter: [],
          custom: [],
        },
        insights: [],
      };
    }
  }
}

export default new AnalyticsService();