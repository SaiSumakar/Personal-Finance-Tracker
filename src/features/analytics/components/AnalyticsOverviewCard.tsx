import { StyleSheet, View, Text } from "react-native";

type Props = {
  totalSpending: number;
  transactionCount: number;
  averageDailySpending: number;
  largestTransaction: number;
  largestTransactionCategory: string;
  mostExpensiveCategory: string;
};

function formatCurrency(value: number) {
  return `₹${Math.abs(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export default function AnalyticsOverviewCard({
  totalSpending,
  transactionCount,
  averageDailySpending,
  largestTransaction,
  largestTransactionCategory,
  mostExpensiveCategory,
}: Props) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Overview</Text>
      </View>

      {/* Main spending */}
      <View style={styles.hero}>
        <Text style={styles.label}>Total spending</Text>

        <Text
          style={styles.total}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatCurrency(totalSpending)}
        </Text>
      </View>

      {/* Quick stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.label}>Transactions</Text>
          <Text style={styles.statValue}>
            {transactionCount.toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.label}>Avg. daily</Text>
          <Text
            style={styles.statValue}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(averageDailySpending)}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detail}>
          <Text style={styles.label}>Largest transaction</Text>

          <View style={styles.detailRight}>
            <Text
              style={styles.categoryName}
              numberOfLines={1}
            >
              {largestTransactionCategory}
            </Text>

            <Text style={styles.detailValue}>
              {formatCurrency(largestTransaction)}
            </Text>
          </View>
        </View>

        <View style={styles.detail}>
          <Text style={styles.label}>Top category</Text>

          <Text
            style={styles.categoryName}
            numberOfLines={1}
          >
            {mostExpensiveCategory}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  header: {
    marginBottom: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.2,
  },

  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9CA3AF",
  },

  /* Hero */

  hero: {
    marginBottom: 12,
  },

  total: {
    marginTop: 2,
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -1,
  },

  /* Quick stats */

  stats: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  stat: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },

  statValue: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: "800",
    color: "#374151",
    letterSpacing: -0.3,
  },

  /* Details */

  details: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
    gap: 10,
  },

  detail: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 26,
  },

  detailRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginLeft: 16,
    gap: 10,
  },
  
  detailValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },

  /* Category */

  categoryRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginLeft: 16,
  },

  categoryName: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },

  categoryAmount: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "800",
    color: "#374151",
  },
});