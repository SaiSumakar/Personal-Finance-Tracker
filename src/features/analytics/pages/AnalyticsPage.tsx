import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect } from "react";

import { Typography } from "../../../theme/typography";
import { Colors } from "../../../theme/colors";
import { Spacing } from "../../../theme/spacing";

import TimePeriodSelector, { TimePeriod } from "../components/TimePeriodSelector";

import AnalyticsOverviewCard from "../components/AnalyticsOverviewCard";
import CategoryAnalysisCard from "../components/CategoryAnalysisCard";
import SpendingTrendCard from "../components/SpendingTrendCard";
import SpendingInsightsCard from "../components/SpendingInsightsCard";
import { useAnalyticsStore } from "../stores/analyticsStore";

export default function AnalyticsPage() {
  const { data, isLoading, error, selectedPeriod, fetchAnalyticsData, setSelectedPeriod } =
    useAnalyticsStore();

  useEffect(() => {
    fetchAnalyticsData(selectedPeriod);
  }, [selectedPeriod]);

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
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
        <Text style={styles.emptyText}>No analytics data available</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.description}>Track spending, spot trends, and make smarter decisions</Text>

      <TimePeriodSelector value={selectedPeriod} onChange={handlePeriodChange} />

      <AnalyticsOverviewCard
        totalSpending={data.overview.totalSpending}
        transactionCount={data.overview.transactionCount}
        averageDailySpending={data.overview.averageDailySpending}
        largestTransaction={data.overview.largestTransaction}
        largestTransactionCategory={data.overview.largestTransactionCategory}
        mostExpensiveCategory={data.overview.mostExpensiveCategory}
      />

      <CategoryAnalysisCard
        categories={data.categories.map((category) => ({
          label: category.label,
          amount: category.amount,
        }))}
      />

      <SpendingTrendCard period={selectedPeriod} data={data.trend[selectedPeriod]} />

      <SpendingInsightsCard insights={data.insights} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#F5F7FB",
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