export interface DashboardData {
  monthlySpending: {
    amount: number;
    change: number;
    isIncrease: boolean;
    topCategory: string;
    topCategoryAmount: number;
  };
  budget: {
    totalBudget: number;
    spent: number;
    remaining: number;
    budgetDate: string;
    budgetCycle: "monthly" | "quarterly" | "yearly";
  };
  financialSummary: {
    income: number;
    expenses: number;
    net: number;
  };
  categories: Array<{
    icon: string | null;
    label: string;
    amount: number;
    percentage: number;
  }>;
  transactions: Array<{
    icon: string | null;
    label: string;
    date: string;
    amount: number;
  }>;
}
