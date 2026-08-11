import { StyleSheet, View, Text } from "react-native";

type Props = {
  totalBudget: number;
  spent: number;
  remaining: number;
  daysRemaining?: number;
};

function formatCurrency(value: number) {
  return `₹${Math.abs(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export default function BudgetCard({
  totalBudget,
  spent,
  remaining,
  daysRemaining = 12,
}: Props) {
  const safeBudget = Math.max(totalBudget, 0);

  const rawPercentage =
    safeBudget > 0
      ? (spent / safeBudget) * 100
      : 0;

  const percentage = Math.round(rawPercentage);

  const progress = Math.min(
    Math.max(rawPercentage, 0),
    100
  );

  const isOverBudget = rawPercentage > 100;
  const isNearLimit =
    rawPercentage >= 80 && !isOverBudget;

  const accentColor = isOverBudget
    ? "#DC2626"
    : isNearLimit
      ? "#D97706"
      : "#2563EB";

  const accentBackground = isOverBudget
    ? "#FEF2F2"
    : isNearLimit
      ? "#FFFBEB"
      : "#EFF6FF";

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Monthly Budget
          </Text>

          <Text style={styles.subtitle}>
            Your limit this month
          </Text>
        </View>

        <View
          style={[
            styles.daysBadge,
            {
              backgroundColor: accentBackground,
            },
          ]}
        >
          <Text
            style={[
              styles.daysValue,
              {
                color: accentColor,
              },
            ]}
          >
            {daysRemaining}
          </Text>

          <Text
            style={[
              styles.daysLabel,
              {
                color: accentColor,
              },
            ]}
          >
            days left
          </Text>
        </View>
      </View>

      {/* Remaining */}
      <View style={styles.remainingSection}>
        <Text style={styles.remainingLabel}>
          {isOverBudget
            ? "Over budget by"
            : "Remaining"}
        </Text>

        <Text
          style={[
            styles.remainingAmount,
            {
              color: isOverBudget
                ? accentColor
                : "#111827",
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatCurrency(remaining)}
        </Text>
      </View>

      {/* Progress info */}
      <View style={styles.progressHeader}>
        <Text style={styles.percentText}>
          {percentage}% spent
        </Text>

        <Text style={styles.limitText}>
          {formatCurrency(totalBudget)} limit
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${progress}%`,
              backgroundColor: accentColor,
            },
          ]}
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
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",

    marginBottom: 20,
  },

  title: {
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

  /* Days */

  daysBadge: {
    flexDirection: "row",
    alignItems: "baseline",

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 10,
  },

  daysValue: {
    fontSize: 14,
    fontWeight: "800",
  },

  daysLabel: {
    marginLeft: 4,

    fontSize: 10,
    fontWeight: "600",
  },

  /* Remaining */

  remainingSection: {
    marginBottom: 20,
  },

  remainingLabel: {
    fontSize: 11,
    fontWeight: "600",

    color: "#9CA3AF",

    marginBottom: 3,
  },

  remainingAmount: {
    fontSize: 34,
    fontWeight: "800",

    letterSpacing: -1,
  },

  /* Progress */

  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 8,
  },

  percentText: {
    fontSize: 12,
    fontWeight: "800",

    color: "#374151",
  },

  limitText: {
    fontSize: 11,
    fontWeight: "600",

    color: "#9CA3AF",
  },

  progressBackground: {
    height: 9,

    backgroundColor: "#F1F5F9",

    borderRadius: 999,

    overflow: "hidden",
  },

  progressBar: {
    height: "100%",

    borderRadius: 999,
  },
});
