import { ScrollView, StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import MonthlySpendingCard from "../components/MonthlySpendingCard";
import BudgetCard from "../components/BudgetCard";
import FinancialSummaryCard from "../components/FinancialSummaryCard";
import CategorySpendingCard from "../components/CategorySpendingCard";
import RecentTransactionsCard from "../components/RecentTransactionsCard";
import AccountsBalancesCard from "../components/AccountBalancesCard";
import { Typography } from "../../../theme/typography";
import { Colors } from "../../../theme/colors";
import { Spacing } from "../../../theme/spacing";
import { useDashboardStore } from "../stores/dashboardStore";
import { useAccountStore } from "@/features/accounts/stores/accountStore";

export default function DashboardPage() {
  const { data, isLoading, error, fetchDashboardData } = useDashboardStore();

  useFocusEffect(
    useCallback(() => {
      void fetchDashboardData();
    }, [fetchDashboardData])
  );

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.description}>Track your spending at a glance</Text>
      <MonthlySpendingCard
        amount={data.monthlySpending.amount}
        change={data.monthlySpending.change}
        isIncrease={data.monthlySpending.isIncrease}
        topCategory={data.monthlySpending.topCategory}
        topCategoryAmount={data.monthlySpending.topCategoryAmount}
      />
      <BudgetCard
        totalBudget={data.budget.totalBudget}
        spent={data.budget.spent}
        remaining={data.budget.remaining}
        budgetDate={data.budget.budgetDate}
        budgetCycle={data.budget.budgetCycle}
      />
      <FinancialSummaryCard
        income={data.financialSummary.income}
        expenses={data.financialSummary.expenses}
        net={data.financialSummary.net}
      />
      <AccountsBalancesCard
        accounts={data.accounts}
      />
      <CategorySpendingCard categories={data.categories} />
      <RecentTransactionsCard transactions={data.transactions} />
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FB",
    padding: 20,
  },
  errorText: {
    fontSize: Typography.body,
    color: "#DC2626",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FB",
  },
  emptyText: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },
});
