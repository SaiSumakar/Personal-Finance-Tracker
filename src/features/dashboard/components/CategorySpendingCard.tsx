import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from "react-native";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Category = {
  // icon?: string; // kept for compatibility, no longer used
  label: string;
  amount: number;
  percentage: number;
};

type CategoryType = "expense" | "income";

type Props = {
  categories: Category[];

  // Optional separate income categories.
  // If you already have separate data, pass it here.
  incomeCategories?: Category[];

  onCategoryPress?: (
    category: Category,
    type: CategoryType
  ) => void;

  onViewAll?: (type: CategoryType) => void;
};

function formatCurrency(value: number) {
  return `₹${Math.abs(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

const BAR_COLORS = [
  "#2563EB",
  "#4F46E5",
  "#7C3AED",
  "#9333EA",
  "#A855F7",
];

function CategoryRow({
  category,
  index,
  type,
  onPress,
}: {
  category: Category;
  index: number;
  type: CategoryType;
  onPress?: () => void;
}) {
  const barColor =
    type === "expense"
      ? BAR_COLORS[index] ?? BAR_COLORS[4]
      : "#16A34A";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.categoryBlock,
        pressed && styles.categoryPressed,
      ]}
    >
      {/* Category information */}
      <View style={styles.categoryRow}>
        <View style={styles.categoryLabelRow}>
          <View
            style={[
              styles.categoryDot,
              { backgroundColor: barColor },
            ]}
          />

          <View style={styles.categoryInfo}>
            <Text
              style={styles.categoryLabel}
              numberOfLines={1}
            >
              {category.label}
            </Text>

            <Text style={styles.categoryAmount}>
              {formatCurrency(category.amount)}
            </Text>
          </View>
        </View>

        <Text style={styles.categoryPercent}>
          {Math.round(category.percentage)}%
        </Text>
      </View>

      {/* Progress */}
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.min(
                Math.max(category.percentage, 0),
                100
              )}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

export default function CategorySpendingCard({
  categories,
  incomeCategories = [],
  onCategoryPress,
  onViewAll,
}: Props) {

  const router = useRouter();

  const [selectedType, setSelectedType] =
    useState<CategoryType>("expense");

  const activeCategories =
    selectedType === "expense"
      ? categories
      : incomeCategories;

  const topCategories = useMemo(() => {
    return [...activeCategories]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [activeCategories]);

  const categoryCount = topCategories.length;

  const hasCategories = categoryCount > 0;

  const handleViewCategorySpending = () => {
    router.push("/analytics");
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.cardTitle}>
            Spending by Category
          </Text>

          <Text style={styles.subtitle}>
            Top {categoryCount}{" "}
            {selectedType === "expense"
              ? "expense"
              : "income"}{" "}
            {categoryCount === 1
              ? "category"
              : "categories"}
          </Text>
        </View>
      </View>

      {/* Expense / Income switch */}
      <View style={styles.segmentContainer}>
        <Pressable
          onPress={() => setSelectedType("expense")}
          style={[
            styles.segment,
            selectedType === "expense" &&
              styles.segmentActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              selectedType === "expense" &&
                styles.segmentTextActive,
            ]}
          >
            Expenses
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSelectedType("income")}
          style={[
            styles.segment,
            selectedType === "income" &&
              styles.segmentActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              selectedType === "income" &&
                styles.segmentTextActive,
            ]}
          >
            Income
          </Text>
        </Pressable>
      </View>

      {/* Categories */}
      {hasCategories ? (
        <View style={styles.list}>
          {topCategories.map((category, index) => (
            <CategoryRow
              key={category.label}
              category={category}
              index={index}
              type={selectedType}
              onPress={() =>
                onCategoryPress?.(
                  category,
                  selectedType
                )
              }
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyDot} />

          <Text style={styles.emptyTitle}>
            No {selectedType === "expense"
              ? "expenses"
              : "income"} yet
          </Text>

          <Text style={styles.emptyText}>
            Your{" "}
            {selectedType === "expense"
              ? "expense"
              : "income"}{" "}
            categories will appear here.
          </Text>
        </View>
      )}

      {/* View all */}
      {hasCategories && (
        <Pressable
          onPress={handleViewCategorySpending}
          style={({ pressed }) => [
            styles.actionRow,
            pressed && styles.actionPressed,
          ]}
        >
          <Text style={styles.actionText}>
            View all{" "}
            {selectedType === "expense"
              ? "expense"
              : "income"}{" "}
            categories
          </Text>

          <Ionicons 
            name="chevron-forward"
            size={14}
            color={"#2563EB"}
            style={styles.actionArrow}
          />
        </Pressable>
      )}
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
    marginBottom: 14,
  },

  headerText: {
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
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },

  /* Segmented control */

  segmentContainer: {
    flexDirection: "row",

    padding: 3,

    backgroundColor: "#F1F5F9",
    borderRadius: 12,

    marginBottom: 16,
  },

  segment: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    minHeight: 36,

    borderRadius: 9,
  },

  segmentActive: {
    backgroundColor: "#FFFFFF",

    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 1,
    },

    elevation: 1,
  },

  segmentText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },

  segmentTextActive: {
    color: "#111827",
    fontWeight: "700",
  },

  /* Categories */

  list: {
    paddingTop: 2,
  },

  categoryBlock: {
    paddingVertical: 11,
    borderRadius: 10,
  },

  categoryPressed: {
    opacity: 0.65,
  },

  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 8,
  },

  categoryLabelRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  categoryDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginRight: 11,
  },

  categoryInfo: {
    flex: 1,
    minWidth: 0,
  },

  categoryLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  categoryAmount: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 3,
  },

  categoryPercent: {
    marginLeft: 12,

    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },

  /* Progress */

  barBackground: {
    height: 7,

    backgroundColor: "#F1F5F9",
    borderRadius: 999,

    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    borderRadius: 999,
  },

  /* Empty state */

  emptyState: {
    alignItems: "center",

    paddingVertical: 28,
    paddingHorizontal: 16,
  },

  emptyDot: {
    width: 10,
    height: 10,

    borderRadius: 999,

    backgroundColor: "#CBD5E1",

    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },

  emptyText: {
    marginTop: 5,

    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",

    color: "#94A3B8",
  },

  /* Action */

  actionRow: {
    minHeight: 44,

    marginTop: 6,

    borderRadius: 12,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
  },
});