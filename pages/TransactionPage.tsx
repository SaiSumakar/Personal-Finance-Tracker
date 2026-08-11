import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SectionList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, isToday, isYesterday } from "date-fns";

import TransactionCard from "../components/transactionsHistory/TransactionCard";

import { useTransactionStore } from "../stores/transactionStore";
import { useCategoryStore } from "../stores/categoryStore";
import { useAccountStore } from "../stores/accountStore";

export default function TransactionPage() {
  const [search, setSearch] = useState("");

  const transactions = useTransactionStore(
    (state) => state.transactions
  );

  const expenseCategories = useCategoryStore(
    (state) => state.expenseCategories
  );

  const incomeCategories = useCategoryStore(
    (state) => state.incomeCategories
  );

  const accounts = useAccountStore(
    (state) => state.accounts
  );

  const loadTransactions = useTransactionStore(
    (state) => state.loadTransactions
  );

  const loadAccounts = useAccountStore(
    (state) => state.loadAccounts
  );

  const loadCategories = useCategoryStore(
    (state) => state.loadCategories
  );

  const categories = useMemo(
    () => [...expenseCategories, ...incomeCategories],
    [expenseCategories, incomeCategories]
  );

  useEffect(() => {
    loadTransactions();
    loadAccounts();
    loadCategories();
  }, [
    loadTransactions,
    loadAccounts,
    loadCategories,
  ]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) =>
        new Date(b.transaction_date).getTime() -
        new Date(a.transaction_date).getTime()
    );
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return sortedTransactions;
    }

    return sortedTransactions.filter((transaction) => {
      const category = categories.find(
        (item) => item.id === transaction.category_id
      );

      const account = accounts.find(
        (item) => item.id === transaction.account_id
      );

      const categoryName =
        category?.name?.toLowerCase() || "";

      const accountName =
        account?.name?.toLowerCase() || "";

      const note =
        transaction.note?.toLowerCase() || "";

      return (
        categoryName.includes(query) ||
        accountName.includes(query) ||
        note.includes(query)
      );
    });
  }, [
    search,
    sortedTransactions,
    categories,
    accounts,
  ]);

  const getCategoryName = (categoryId?: number) => {
    return categories.find(
      (category) => category.id === categoryId
    )?.name;
  };

  const getAccountName = (accountId?: number) => {
    return accounts.find(
      (account) => account.id === accountId
    )?.name;
  };

  const formatSectionTitle = (dateString: string) => {
    const date = new Date(dateString);

    if (isToday(date)) {
      return "Today";
    }

    if (isYesterday(date)) {
      return "Yesterday";
    }

    return format(date, "dd MMM yyyy");
  };

  const transactionSections = useMemo(() => {
    type Section = {
      title: string;
      data: typeof filteredTransactions;
    };

    const sections: Section[] = [];

    filteredTransactions.forEach((transaction) => {
      const title = formatSectionTitle(
        transaction.transaction_date
      );

      const lastSection =
        sections[sections.length - 1];

      if (
        lastSection &&
        lastSection.title === title
      ) {
        lastSection.data.push(transaction);
      } else {
        sections.push({
          title,
          data: [transaction],
        });
      }
    });

    return sections;
  }, [filteredTransactions]);

  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce(
      (total, transaction) => {
        return transaction.type === "income"
          ? total + transaction.amount
          : total - transaction.amount;
      },
      0
    );
  }, [filteredTransactions]);

  const formatCurrency = (value: number) => {
    return `₹${Math.abs(value).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  const renderTransaction = ({
    item,
  }: {
    item: (typeof filteredTransactions)[number];
  }) => {
    const cardTransaction = {
      id: item.id.toString(),
      amount: item.amount,
      type:
        item.type === "income"
          ? ("income" as const)
          : ("expense" as const),
      date: item.transaction_date,
      note: item.note ?? undefined,
      categoryId:
        item.category_id.toString(),
      accountId:
        item.account_id.toString(),
    };

    return (
      <TransactionCard
        transaction={cardTransaction}
        categoryName={getCategoryName(
          item.category_id
        )}
        accountName={getAccountName(
          item.account_id
        )}
        onPress={() => {
          // Transaction details/edit screen later.
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.toolbar}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={19}
            color="#94A3B8"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search transactions"
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            returnKeyType="search"
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              hitSlop={10}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color="#94A3B8"
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.75}
          onPress={() => {
            // Filter functionality later.
          }}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color="#334155"
          />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View>
          <Text style={styles.summaryLabel}>
            {search
              ? "Search results"
              : "All transactions"}
          </Text>

          <Text style={styles.summaryCount}>
            {filteredTransactions.length}{" "}
            {filteredTransactions.length === 1
              ? "transaction"
              : "transactions"}
          </Text>
        </View>

        {filteredTransactions.length > 0 && (
          <View style={styles.netAmountContainer}>
            <Text style={styles.netLabel}>
              Net
            </Text>

            <Text
              style={[
                styles.netAmount,
                {
                  color:
                    totalAmount >= 0
                      ? "#15803D"
                      : "#DC2626",
                },
              ]}
            >
              {totalAmount >= 0 ? "+" : "-"}
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        )}
      </View>

      {/* Transaction List */}
      <SectionList
        sections={transactionSections}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderTransaction}
        renderSectionHeader={({
          section: { title, data },
        }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {title}
            </Text>

            <Text style={styles.sectionCount}>
              {data.length}
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          transactionSections.length === 0 &&
            styles.emptyListContent,
        ]}
        keyboardShouldPersistTaps="handled"
        stickySectionHeadersEnabled={false}
        ItemSeparatorComponent={() => (
          <View style={styles.itemSeparator} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name={
                  search
                    ? "search-outline"
                    : "receipt-outline"
                }
                size={28}
                color="#64748B"
              />
            </View>

            <Text style={styles.emptyTitle}>
              {search
                ? "No transactions found"
                : "No transactions yet"}
            </Text>

            <Text style={styles.emptyDescription}>
              {search
                ? "Try another category, account, or keyword."
                : "Transactions you add will appear here."}
            </Text>

            {search.length > 0 && (
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => setSearch("")}
                activeOpacity={0.75}
              >
                <Text style={styles.clearSearchText}>
                  Clear search
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
  },

  /* Toolbar */

  toolbar: {
    flexDirection: "row",
    alignItems: "center",

    paddingTop: 12,
    marginBottom: 16,
  },

  searchContainer: {
    flex: 1,
    height: 48,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 15,

    paddingHorizontal: 14,

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  searchInput: {
    flex: 1,

    fontSize: 14,
    color: "#0F172A",

    marginLeft: 9,

    paddingVertical: 0,
  },

  filterButton: {
    width: 48,
    height: 48,

    marginLeft: 9,

    borderRadius: 15,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  /* Summary */

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 8,
    paddingHorizontal: 2,
  },

  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },

  summaryCount: {
    marginTop: 2,

    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },

  netAmountContainer: {
    alignItems: "flex-end",
  },

  netLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
  },

  netAmount: {
    marginTop: 2,

    fontSize: 14,
    fontWeight: "800",
  },

  /* List */

  listContent: {
    paddingTop: 2,
    paddingBottom: 32,
  },

  itemSeparator: {
    height: 0,
  },

  /* Section */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",

    paddingTop: 16,
    paddingBottom: 8,

    paddingHorizontal: 2,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",

    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  sectionCount: {
    minWidth: 21,
    height: 21,

    paddingHorizontal: 6,

    marginLeft: 7,

    borderRadius: 999,

    backgroundColor: "#E2E8F0",

    textAlign: "center",
    textAlignVertical: "center",

    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
  },

  /* Empty */

  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyContainer: {
    alignItems: "center",

    paddingHorizontal: 32,
    paddingBottom: 80,
  },

  emptyIconContainer: {
    width: 68,
    height: 68,

    borderRadius: 22,

    backgroundColor: "#E2E8F0",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",

    marginBottom: 6,
  },

  emptyDescription: {
    fontSize: 13,
    lineHeight: 19,

    textAlign: "center",

    color: "#94A3B8",
  },

  clearSearchButton: {
    marginTop: 18,

    paddingHorizontal: 16,
    paddingVertical: 9,

    borderRadius: 10,

    backgroundColor: "#E2E8F0",
  },

  clearSearchText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
});