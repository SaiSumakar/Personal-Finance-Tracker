import { StyleSheet, View, Text, Pressable } from "react-native";

type Transaction = {
  icon?: string; // kept for compatibility, no longer used
  label: string;
  date: string;
  amount: number;
};

type Props = {
  transactions: Transaction[];
};

function formatCurrency(value: number) {
  return `₹${Math.abs(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export default function RecentTransactionsCard({
  transactions,
}: Props) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.cardTitle}>
            Recent Transactions
          </Text>

          <Text style={styles.subtitle}>
            Your latest activity
          </Text>
        </View>

        <Text style={styles.transactionCount}>
          {transactions.length}
        </Text>
      </View>

      {/* Transactions */}
      <View style={styles.list}>
        {transactions.map((transaction, index) => {
          const isIncome = transaction.amount > 0;

          return (
            <Pressable
              key={`${transaction.label}-${transaction.date}-${index}`}
              style={({ pressed }) => [
                styles.transactionRow,
                pressed && styles.transactionPressed,
                index !== transactions.length - 1 &&
                  styles.transactionWithBorder,
              ]}
              android_ripple={{
                color: "#F1F5F9",
              }}
            >
              <View style={styles.transactionLeft}>
                {/* Category indicator */}
                <View
                  style={[
                    styles.dot,
                    isIncome
                      ? styles.incomeDot
                      : styles.expenseDot,
                  ]}
                />

                <View style={styles.transactionInfo}>
                  <Text
                    style={styles.transactionLabel}
                    numberOfLines={1}
                  >
                    {transaction.label}
                  </Text>

                  <Text style={styles.transactionDate}>
                    {transaction.date}
                  </Text>
                </View>
              </View>

              {/* Amount */}
              <Text
                style={[
                  styles.transactionAmount,
                  isIncome
                    ? styles.incomeAmount
                    : styles.expenseAmount,
                ]}
              >
                {isIncome ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* View All */}
      <Pressable
        style={({ pressed }) => [
          styles.actionRow,
          pressed && styles.actionPressed,
        ]}
      >
        <Text style={styles.actionText}>
          View all transactions
        </Text>

        <Text style={styles.actionArrow}>→</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 24,

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
    marginBottom: 14,
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

  transactionCount: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 7,

    borderRadius: 8,

    backgroundColor: "#F1F5F9",

    textAlign: "center",
    textAlignVertical: "center",

    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },

  /* Transaction list */

  list: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  transactionRow: {
    minHeight: 64,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingVertical: 12,
  },

  transactionWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  transactionPressed: {
    opacity: 0.65,
  },

  /* Left side */

  transactionLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,

    marginRight: 12,
  },

  incomeDot: {
    backgroundColor: "#16A34A",
  },

  expenseDot: {
    backgroundColor: "#DC2626",
  },

  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },

  transactionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  transactionDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 3,
  },

  /* Amount */

  transactionAmount: {
    marginLeft: 12,

    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  incomeAmount: {
    color: "#15803D",
  },

  expenseAmount: {
    color: "#DC2626",
  },

  /* Action */

  actionRow: {
    minHeight: 44,

    marginTop: 8,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: 12,
  },

  actionPressed: {
    backgroundColor: "#F8FAFC",
  },

  actionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },

  actionArrow: {
    marginLeft: 7,
    fontSize: 16,
    fontWeight: "700",
    color: "#2563EB",
  },
});

