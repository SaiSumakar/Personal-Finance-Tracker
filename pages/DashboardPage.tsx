import { ScrollView, StyleSheet, View, Text } from "react-native";
import MonthlySpendingCard from "../components/dashboard/MonthlySpendingCard";
import BudgetCard from "../components/dashboard/BudgetCard";
import FinancialSummaryCard from "../components/dashboard/FinancialSummaryCard";
import CategorySpendingCard from "../components/dashboard/CategorySpendingCard";
import RecentTransactionsCard from "../components/dashboard/RecentTransactionsCard";
import { Typography } from "../constants/typography";
import { Colors } from "../constants/colors";
import { Spacing } from "../constants/spacing";

const dummyCategories = [
  { icon: "fast-food", label: "Food", amount: 6200, percentage: 33 },
  { icon: "car", label: "Transport", amount: 3100, percentage: 16 },
  { icon: "cart", label: "Shopping", amount: 2800, percentage: 15 },
  { icon: "cafe", label: "Coffee", amount: 1250, percentage: 7 },
];

const dummyTransactions = [
  { icon: "fast-food", label: "Lunch", date: "Aug 12", amount: -180 },
  { icon: "car", label: "Uber", date: "Aug 11", amount: -240 },
  { icon: "cart", label: "Groceries", date: "Aug 10", amount: -850 },
  { icon: "cafe", label: "Coffee", date: "Aug 09", amount: -120 },
  { icon: "cash", label: "Freelance", date: "Aug 08", amount: 5500 },
];

export default function DashboardPage() {
  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.description}>Track your spending at a glance</Text>
      <MonthlySpendingCard
        amount={18450}
        change={8.2}
        isIncrease
      />
      <BudgetCard
        totalBudget={30000}
        spent={18450}
        remaining={11550}
      />
      <FinancialSummaryCard
        income={35000}
        expenses={18450}
        net={16550}
      />
      <CategorySpendingCard categories={dummyCategories} />
      <RecentTransactionsCard transactions={dummyTransactions} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#F5F7FB",
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 18,
    color: "#111827",
  },
  description: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
});
