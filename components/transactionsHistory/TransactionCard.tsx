import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { format } from "date-fns";

type TransactionType = "income" | "expense";

interface TransactionCardProps {
  transaction: {
    id: string;
    amount: number;
    type: TransactionType;
    date: string | Date;
    note?: string;
    categoryId?: string;
    accountId?: string;
  };
  categoryName?: string;
  accountName?: string;
  onPress?: () => void;
}

export default function TransactionCard({
  transaction,
  categoryName,
  accountName,
  onPress,
}: TransactionCardProps) {
  const isIncome = transaction.type === "income";

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={styles.card}
    >
      {/* Left */}
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconContainer,
            isIncome
              ? styles.incomeIconContainer
              : styles.expenseIconContainer,
          ]}
        >
          <Text style={styles.icon}>
            {isIncome ? "↗" : "↘"}
          </Text>
        </View>

        <View style={styles.details}>
          <Text style={styles.category} numberOfLines={1}>
            {categoryName || "Uncategorized"}
          </Text>

          <View style={styles.metaRow}>
            {accountName && (
              <>
                <Text style={styles.metaText} numberOfLines={1}>
                  {accountName}
                </Text>

                <Text style={styles.dot}>•</Text>
              </>
            )}

            <Text style={styles.metaText}>
              {format(new Date(transaction.date), "dd MMM yyyy")}
            </Text>
          </View>

          {transaction.note ? (
            <Text style={styles.note} numberOfLines={1}>
              {transaction.note}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Amount */}
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            isIncome ? styles.incomeAmount : styles.expenseAmount,
          ]}
        >
          {isIncome ? "+" : "-"}₹
          {transaction.amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#FFFFFF",

    borderRadius: 16,

    paddingHorizontal: 16,
    paddingVertical: 15,

    marginBottom: 10,

    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",

    flex: 1,
    minWidth: 0,
  },

  iconContainer: {
    width: 44,
    height: 44,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  incomeIconContainer: {
    backgroundColor: "#EAF8F0",
  },

  expenseIconContainer: {
    backgroundColor: "#FFF0F0",
  },

  icon: {
    fontSize: 21,
    fontWeight: "600",
  },

  details: {
    flex: 1,
    minWidth: 0,
  },

  category: {
    fontSize: 15,
    fontWeight: "600",
    color: "#171717",

    marginBottom: 4,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",

    maxWidth: "100%",
  },

  metaText: {
    fontSize: 12,
    color: "#8A8A8A",

    maxWidth: "45%",
  },

  dot: {
    fontSize: 12,
    color: "#B5B5B5",

    marginHorizontal: 5,
  },

  note: {
    fontSize: 12,
    color: "#9A9A9A",

    marginTop: 3,
  },

  amountContainer: {
    marginLeft: 10,

    alignItems: "flex-end",
  },

  amount: {
    fontSize: 15,
    fontWeight: "700",
  },

  incomeAmount: {
    color: "#159447",
  },

  expenseAmount: {
    color: "#D93636",
  },
});