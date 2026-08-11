import { StyleSheet, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Transaction = {
  icon: string;
  label: string;
  date: string;
  amount: number;
};

type Props = {
  transactions: Transaction[];
};

export default function RecentTransactionsCard({ transactions }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Recent Transactions</Text>
      <View style={styles.list}>
        {transactions.map((transaction, index) => (
          <View key={`${transaction.label}-${transaction.date}`} style={[styles.transactionRow, index !== transactions.length - 1 && styles.transactionRowSpacing]}>
            <View style={styles.transactionLeft}>
              <Ionicons name={transaction.icon as any} size={20} color="#111827" style={styles.icon} />
              <View>
                <Text style={styles.transactionLabel}>{transaction.label}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
            </View>
            <Text style={[styles.transactionAmount, { color: transaction.amount < 0 ? "#DC2626" : "#16A34A" }]}>₹{transaction.amount.toLocaleString()}</Text>
          </View>
        ))}
      </View>
      <Pressable style={styles.actionRow}>
        <Text style={styles.actionText}>View All Transactions</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.05)",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 18,
  },
  list: {
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionRowSpacing: {
    marginBottom: 16,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  transactionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  transactionDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  actionRow: {
    marginTop: 18,
    alignItems: "flex-end",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },
});
