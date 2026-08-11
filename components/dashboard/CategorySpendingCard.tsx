import { StyleSheet, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Category = {
  icon: string;
  label: string;
  amount: number;
  percentage: number;
};

type Props = {
  categories: Category[];
};

function CategoryRow({ category }: { category: Category }) {
  return (
    <View style={styles.categoryRow}>
      <View style={styles.categoryLabelRow}>
        <Ionicons name={category.icon as any} size={18} color="#111827" style={styles.icon} />
        <View>
          <Text style={styles.categoryLabel}>{category.label}</Text>
          <Text style={styles.categoryAmount}>₹{category.amount.toLocaleString()}</Text>
        </View>
      </View>
      <Text style={styles.categoryPercent}>{category.percentage}%</Text>
    </View>
  );
}

export default function CategorySpendingCard({ categories }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Spending by Category</Text>
      <View style={styles.list}>
        {categories.map((category) => (
          <View key={category.label} style={styles.categoryBlock}>
            <CategoryRow category={category} />
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: `${category.percentage}%` }]} />
            </View>
          </View>
        ))}
      </View>
      <Pressable style={styles.actionRow}>
        <Text style={styles.actionText}>View Analytics</Text>
      </Pressable>
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
  list: {
    paddingBottom: 2,
  },
  categoryBlock: {
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  categoryAmount: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  categoryPercent: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  barBackground: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 999,
  },
  actionRow: {
    marginTop: 18,
    alignItems: "flex-start",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },
});
