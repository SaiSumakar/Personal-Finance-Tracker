import { StyleSheet, View, Text } from "react-native";

type Props = {
  income: number;
  expenses: number;
  net: number;
};

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>₹{value.toLocaleString()}</Text>
    </View>
  );
}

export default function FinancialSummaryCard({ income, expenses, net }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Financial Summary</Text>
      <View style={styles.summaryRow}>
        <SummaryItem label="Income" value={income} />
        <SummaryItem label="Expenses" value={expenses} />
        <SummaryItem label="Balance" value={net} />
      </View>
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
    marginBottom: 18,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    minWidth: 80,
    padding: 14,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    alignItems: "center",
    marginRight: 12,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
});
