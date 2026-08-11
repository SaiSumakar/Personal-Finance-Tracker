import { StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  amount: number;
  change: number;
  isIncrease: boolean;
  description: string;
};

export default function MonthlySpendingCard({ amount, change, isIncrease, description }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.cardTitle}>Monthly Spending</Text>
        <View style={styles.statusPill}>
          <Ionicons
            name={isIncrease ? "trending-up" : "trending-down"}
            size={14}
            color={isIncrease ? "#1D4ED8" : "#DC2626"}
          />
          <Text style={[styles.statusText, { color: isIncrease ? "#1D4ED8" : "#DC2626" }]}> {isIncrease ? "Up" : "Down"}</Text>
        </View>
      </View>
      <Text style={styles.amount}>₹{amount.toLocaleString()}</Text>
      <Text style={styles.changeText}>
        <Text style={{ color: isIncrease ? "#1D4ED8" : "#DC2626" }}>
          {isIncrease ? "↑" : "↓"} {change}%
        </Text>{" "}
        {description}
      </Text>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(59, 130, 246, 0.08)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  amount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  changeText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
});
