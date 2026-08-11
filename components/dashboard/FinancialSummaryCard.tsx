import { StyleSheet, View, Text } from "react-native";

type Props = {
  income: number;
  expenses: number;
  net: number;
};

function formatCurrency(value: number) {
  return `₹${Math.abs(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function SummaryItem({
  label,
  value,
  type,
}: {
  label: string;
  value: number;
  type: "income" | "expense";
}) {
  return (
    <View style={styles.summaryItem}>
      <View
        style={[
          styles.icon,
          type === "income"
            ? styles.incomeIcon
            : styles.expenseIcon,
        ]}
      >
        <Text style={styles.iconText}>
          {type === "income" ? "↑" : "↓"}
        </Text>
      </View>

      <View style={styles.itemContent}>
        <Text style={styles.summaryLabel}>{label}</Text>

        <Text
          style={[
            styles.summaryValue,
            type === "income"
              ? styles.incomeValue
              : styles.expenseValue,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatCurrency(value)}
        </Text>
      </View>
    </View>
  );
}

export default function FinancialSummaryCard({
  income,
  expenses,
  net,
}: Props) {
  const isPositive = net >= 0;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.cardTitle}>Financial Summary</Text>
          <Text style={styles.subtitle}>
            Your money at a glance
          </Text>
        </View>
      </View>

      {/* Balance */}
      <View
        style={[
          styles.balanceCard,
          isPositive
            ? styles.positiveBalance
            : styles.negativeBalance,
        ]}
      >
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>
            Net Balance
          </Text>

          <View
            style={[
              styles.balanceBadge,
              isPositive
                ? styles.positiveBadge
                : styles.negativeBadge,
            ]}
          >
            <Text
              style={[
                styles.balanceBadgeText,
                isPositive
                  ? styles.positiveBadgeText
                  : styles.negativeBadgeText,
              ]}
            >
              {isPositive ? "Positive" : "Negative"}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.balanceValue,
            isPositive
              ? styles.positiveText
              : styles.negativeText,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {net < 0 ? "-" : ""}
          {formatCurrency(net)}
        </Text>
      </View>

      {/* Income / Expenses */}
      <View style={styles.summaryRow}>
        <SummaryItem
          label="Income"
          value={income}
          type="income"
        />

        <View style={styles.divider} />

        <SummaryItem
          label="Expenses"
          value={expenses}
          type="expense"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.2,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },

  /* Balance */

  balanceCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,

    borderWidth: 1,
  },

  positiveBalance: {
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
  },

  negativeBalance: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FFEDD5",
  },

  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  balanceLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },

  balanceBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },

  positiveBadge: {
    backgroundColor: "#DCFCE7",
  },

  negativeBadge: {
    backgroundColor: "#FFEDD5",
  },

  balanceBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  positiveBadgeText: {
    color: "#15803D",
  },

  negativeBadgeText: {
    color: "#C2410C",
  },

  balanceValue: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.8,
  },

  positiveText: {
    color: "#15803D",
  },

  negativeText: {
    color: "#C2410C",
  },

  /* Income / Expense */

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  summaryItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  incomeIcon: {
    backgroundColor: "#DCFCE7",
  },

  expenseIcon: {
    backgroundColor: "#FEE2E2",
  },

  iconText: {
    fontSize: 17,
    fontWeight: "800",
  },

  itemContent: {
    flex: 1,
  },

  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 3,
  },

  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  incomeValue: {
    color: "#15803D",
  },

  expenseValue: {
    color: "#DC2626",
  },

  divider: {
    width: 1,
    height: 34,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 14,
  },
});

