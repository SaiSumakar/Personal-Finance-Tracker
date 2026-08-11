import { StyleSheet, View, Text } from "react-native";

type Props = {
  totalBudget: number;
  spent: number;
  remaining: number;
};

export default function BudgetCard({ totalBudget, spent, remaining }: Props) {
  const progress = Math.min(Math.max(spent / totalBudget, 0), 1);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Monthly Budget</Text>
      <View style={styles.budgetRow}>
        <Text style={styles.budgetAmount}>₹{spent.toLocaleString()}</Text>
        <Text style={styles.budgetTotal}>/ ₹{totalBudget.toLocaleString()}</Text>
      </View>
      <View style={styles.progressBackground}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.remainingText}>₹{remaining.toLocaleString()} remaining</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 14,
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  budgetAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  budgetTotal: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  progressBackground: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 14,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 999,
  },
  remainingText: {
    fontSize: 14,
    color: "#4B5563",
  },
});
