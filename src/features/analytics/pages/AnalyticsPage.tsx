import {
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";

import { Typography } from "../../../theme/typography";
import { Colors } from "../../../theme/colors";
import { Spacing } from "../../../theme/spacing";

import TimePeriodSelector, {
  TimePeriod,
} from "../components/TimePeriodSelector";

import AnalyticsOverviewCard from "../components/AnalyticsOverviewCard";
import CategoryAnalysisCard from "../components/CategoryAnalysisCard";
import SpendingTrendCard from "../components/SpendingTrendCard";
import SpendingInsightsCard from "../components/SpendingInsightsCard";

export default function AnalyticsPage() {
  const selectedPeriod: TimePeriod = "month";

  const handlePeriodChange = (period: TimePeriod) => {
    // Functionality will be added later.
    console.log("Selected period:", period);
  };

  const trendData = {
    week: [
      { label: "Mon", value: 720 },
      { label: "Tue", value: 1250 },
      { label: "Wed", value: 860 },
      { label: "Thu", value: 1480 },
      { label: "Fri", value: 1120 },
      { label: "Sat", value: 1980 },
      { label: "Sun", value: 920 },
    ],

    month: [
      { label: "1", value: 620 },
      { label: "5", value: 980 },
      { label: "10", value: 760 },
      { label: "15", value: 1240 },
      { label: "20", value: 920 },
      { label: "25", value: 1680 },
      { label: "30", value: 1420 },
    ],

    quarter: [
      { label: "Apr", value: 18200 },
      { label: "May", value: 22400 },
      { label: "Jun", value: 24580 },
    ],

    custom: [
      { label: "Aug 1", value: 820 },
      { label: "Aug 5", value: 1460 },
      { label: "Aug 9", value: 980 },
      { label: "Aug 13", value: 1740 },
      { label: "Aug 17", value: 1280 },
      { label: "Aug 21", value: 2100 },
    ],
  };

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.description}>
        Track spending, spot trends, and make smarter
        decisions
      </Text>

      <TimePeriodSelector
        value={selectedPeriod}
        onChange={handlePeriodChange}
      />

      <AnalyticsOverviewCard
        totalSpending={24580}
        transactionCount={42}
        averageDailySpending={792.9}
        largestTransaction={4250}
        largestTransactionCategory="Clothes"
        mostExpensiveCategory="Food"
      />

      <CategoryAnalysisCard
        categories={[
          { label: "Food", amount: 6250 },
          { label: "Shopping", amount: 4820 },
          { label: "Transport", amount: 3240 },
          { label: "Bills", amount: 2760 },
          { label: "Entertainment", amount: 1810 },
        ]}
      />

      <SpendingTrendCard
        period={selectedPeriod}
        data={trendData[selectedPeriod]}
      />

      <SpendingInsightsCard
        insights={[
          {
            question: "Where is most of my money going?",
            answer:
              "Food is your largest expense category at ₹6,250 this month.",
            accent: "blue",
          },
          {
            question: "Am I spending more than before?",
            answer:
              "Your spending is 18% higher than last month.",
            accent: "red",
          },
          {
            question: "When do I spend the most?",
            answer:
              "You spend 18% more on weekends than on weekdays.",
            accent: "amber",
          },
          {
            question: "What was my biggest expense?",
            answer:
              "Your largest transaction this month was ₹4,250 on Clothes.",
            accent: "blue",
          },
          {
            question: "Which category changed the most?",
            answer:
              "Shopping spending is 32% lower than last month.",
            accent: "green",
          },
        ]}
      />
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
});