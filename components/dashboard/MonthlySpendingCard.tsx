import { StyleSheet, View, Text } from "react-native";

type Props = {
  amount: number;
  change: number;
  isIncrease: boolean;
  topCategory?: string;
  topCategoryAmount?: number;

  // Actual weekly spending data.
  // Example: [1200, 1800, 1400, 2300]
  weeklySpending?: number[];
};

function formatCurrency(value: number) {
  return `₹${Math.abs(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export default function MonthlySpendingCard({
  amount,
  change,
  isIncrease,
  topCategory = "Food",
  topCategoryAmount = 0,
  weeklySpending = [],
}: Props) {
  const accentColor = isIncrease ? "#DC2626" : "#15803D";
  const accentBackground = isIncrease
    ? "#FEF2F2"
    : "#F0FDF4";

  const maxWeeklySpending =
    weeklySpending.length > 0
      ? Math.max(...weeklySpending)
      : 0;

  const hasChartData =
    weeklySpending.length > 0 && maxWeeklySpending > 0;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.cardTitle}>
            Monthly Spending
          </Text>

          <Text style={styles.subtitle}>
            Compared with last month
          </Text>
        </View>

        <View
          style={[
            styles.changePill,
            {
              backgroundColor: accentBackground,
            },
          ]}
        >
          <Text
            style={[
              styles.changeArrow,
              { color: accentColor },
            ]}
          >
            {isIncrease ? "↑" : "↓"}
          </Text>

          <Text
            style={[
              styles.changeValue,
              { color: accentColor },
            ]}
          >
            {change}%
          </Text>
        </View>
      </View>

      {/* Main spending */}
      <View style={styles.amountSection}>
        <Text
          style={styles.amount}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatCurrency(amount)}
        </Text>

        <Text style={styles.amountLabel}>
          spent this month
        </Text>
      </View>

      {/* Comparison */}
      {/* <View
        style={[
          styles.comparison,
          {
            backgroundColor: accentBackground,
          },
        ]}
      >
        <View
          style={[
            styles.comparisonIndicator,
            {
              backgroundColor: accentColor,
            },
          ]}
        />

        <Text style={styles.comparisonText}>
          {isIncrease
            ? "You're spending more than last month"
            : "You're spending less than last month"}
        </Text>
      </View> */}

      {/* Weekly trend */}
      {hasChartData && (
        <View style={styles.trendSection}>
          <View style={styles.trendHeader}>
            <Text style={styles.sectionLabel}>
              Weekly spending
            </Text>

            <Text style={styles.trendHint}>
              {weeklySpending.length} weeks
            </Text>
          </View>

          <View style={styles.chart}>
            {weeklySpending.map((value, index) => {
              const height =
                (value / maxWeeklySpending) * 48;

              const isLast =
                index === weeklySpending.length - 1;

              return (
                <View
                  key={index}
                  style={styles.barWrapper}
                >
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(height, 5),
                        backgroundColor: isLast
                          ? accentColor
                          : "#CBD5E1",
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>

          <View style={styles.chartLabels}>
            {weeklySpending.map((_, index) => (
              <Text
                key={index}
                style={styles.chartLabel}
              >
                W{index + 1}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Top category */}
      <View style={styles.footer}>
        <View style={styles.categoryLeft}>
          <View
            style={[
              styles.categoryDot,
              {
                backgroundColor: accentColor,
              },
            ]}
          />

          <View>
            <Text style={styles.categoryLabel}>
              Top category
            </Text>

            <Text
              style={styles.categoryName}
              numberOfLines={1}
            >
              {topCategory}
            </Text>
          </View>
        </View>

        <View style={styles.categoryRight}>
          <Text style={styles.categoryAmount}>
            {formatCurrency(topCategoryAmount)}
          </Text>

          <Text style={styles.categorySubtext}>
            this month
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,

    backgroundColor: "#FFFFFF",
    borderRadius: 22,

    padding: 18,
    marginBottom: 16,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 3,
  },

  /* Header */

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",

    marginBottom: 18,
  },

  headerContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",

    color: "#111827",

    letterSpacing: -0.2,
  },

  subtitle: {
    marginTop: 3,

    fontSize: 11,
    fontWeight: "500",

    color: "#9CA3AF",
  },

  /* Change */

  changePill: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 9,
    paddingVertical: 6,

    borderRadius: 999,

    marginLeft: 12,
  },

  changeArrow: {
    fontSize: 13,
    fontWeight: "800",
  },

  changeValue: {
    marginLeft: 3,

    fontSize: 11,
    fontWeight: "800",
  },

  /* Amount */

  amountSection: {
    marginBottom: 14,
  },

  amount: {
    fontSize: 34,
    fontWeight: "800",

    color: "#111827",

    letterSpacing: -1,
  },

  amountLabel: {
    marginTop: 3,

    fontSize: 11,
    fontWeight: "500",

    color: "#9CA3AF",
  },

  /* Comparison */

  comparison: {
    flexDirection: "row",
    alignItems: "center",

    minHeight: 38,

    paddingHorizontal: 11,
    paddingVertical: 8,

    borderRadius: 10,
  },

  comparisonIndicator: {
    width: 6,
    height: 6,

    borderRadius: 999,

    marginRight: 8,
  },

  comparisonText: {
    flex: 1,

    fontSize: 11,
    fontWeight: "600",

    color: "#64748B",

    lineHeight: 16,
  },

  /* Trend */

  trendSection: {
    marginTop: 18,
    marginBottom: 17,
  },

  trendHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 9,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",

    color: "#64748B",
  },

  trendHint: {
    fontSize: 10,
    fontWeight: "500",

    color: "#CBD5E1",
  },

  chart: {
    height: 52,

    flexDirection: "row",
    alignItems: "flex-end",

    justifyContent: "space-between",

    paddingHorizontal: 3,

    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  barWrapper: {
    flex: 1,

    height: 52,

    alignItems: "center",
    justifyContent: "flex-end",
  },

  bar: {
    width: 18,

    minHeight: 5,

    borderRadius: 5,
  },

  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",

    paddingHorizontal: 1,

    marginTop: 6,
  },

  chartLabel: {
    fontSize: 9,

    color: "#A1A1AA",

    textAlign: "center",
  },

  /* Footer */

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingTop: 14,

    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  categoryLeft: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",

    minWidth: 0,
  },

  categoryDot: {
    width: 8,
    height: 8,

    borderRadius: 999,

    marginRight: 10,
  },

  categoryLabel: {
    fontSize: 10,
    fontWeight: "600",

    color: "#9CA3AF",
  },

  categoryName: {
    marginTop: 2,

    fontSize: 13,
    fontWeight: "700",

    color: "#374151",
  },

  categoryRight: {
    alignItems: "flex-end",

    marginLeft: 12,
  },

  categoryAmount: {
    fontSize: 14,
    fontWeight: "800",

    color: "#111827",
  },

  categorySubtext: {
    marginTop: 2,

    fontSize: 9,
    fontWeight: "500",

    color: "#9CA3AF",
  },
});