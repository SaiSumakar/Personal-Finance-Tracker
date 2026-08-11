import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

  const accentColor = isIncome
    ? "#15803D"
    : "#DC2626";

  const iconBackground = isIncome
    ? "#F0FDF4"
    : "#FEF2F2";

  const iconName = isIncome
    ? "arrow-down-outline"
    : "arrow-up-outline";

  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      style={styles.card}
    >
      {/* Category Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons
          name={iconName}
          size={19}
          color={accentColor}
        />
      </View>

      {/* Main Details */}
      <View style={styles.details}>
        <Text
          style={styles.category}
          numberOfLines={1}
        >
          {categoryName || "Uncategorized"}
        </Text>

        <View style={styles.metaRow}>
          {accountName && (
            <>
              <Ionicons
                name="wallet-outline"
                size={11}
                color="#94A3B8"
              />

              <Text
                style={styles.metaText}
                numberOfLines={1}
              >
                {accountName}
              </Text>

              <View style={styles.dot} />
            </>
          )}

          <Text style={styles.metaText}>
            {format(
              new Date(transaction.date),
              "dd MMM"
            )}
          </Text>
        </View>

        {transaction.note ? (
          <Text
            style={styles.note}
            numberOfLines={1}
          >
            {transaction.note}
          </Text>
        ) : null}
      </View>

      {/* Amount */}
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            { color: accentColor },
          ]}
        >
          {isIncome ? "+" : "-"}₹
          {transaction.amount.toLocaleString(
            "en-IN",
            {
              maximumFractionDigits: 2,
            }
          )}
        </Text>

        <Ionicons
          name="chevron-forward"
          size={14}
          color="#CBD5E1"
          style={styles.chevron}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 17,

    paddingHorizontal: 14,
    paddingVertical: 14,

    marginBottom: 9,

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  iconContainer: {
    width: 43,
    height: 43,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  details: {
    flex: 1,
    minWidth: 0,
  },

  category: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",

    marginBottom: 5,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",

    minWidth: 0,
  },

  metaText: {
    fontSize: 11,
    color: "#94A3B8",

    marginLeft: 4,

    maxWidth: "42%",
  },

  dot: {
    width: 3,
    height: 3,

    borderRadius: 2,

    backgroundColor: "#CBD5E1",

    marginHorizontal: 7,
  },

  note: {
    fontSize: 11,
    color: "#A1A1AA",

    marginTop: 4,
  },

  amountContainer: {
    marginLeft: 8,

    alignItems: "flex-end",
    justifyContent: "center",
  },

  amount: {
    fontSize: 14,
    fontWeight: "800",
  },

  chevron: {
    marginTop: 5,
  },
});