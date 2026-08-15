export type AnalyticsTimePeriod = "week" | "month" | "quarter" | "custom";

export interface AnalyticsOverview {
  totalSpending: number;
  transactionCount: number;
  averageDailySpending: number;
  largestTransaction: number;
  largestTransactionCategory: string;
  mostExpensiveCategory: string;
}

export interface AnalyticsCategory {
  label: string;
  amount: number;
  percentage: number;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export type InsightAccent = "blue" | "green" | "red" | "amber";

export interface AnalyticsInsight {
  question: string;
  answer: string;
  accent: InsightAccent;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  categories: AnalyticsCategory[];
  trend: Record<AnalyticsTimePeriod, TrendPoint[]>;
  insights: AnalyticsInsight[];
}
