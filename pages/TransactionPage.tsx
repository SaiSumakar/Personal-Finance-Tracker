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
  }, [loadTransactions, loadAccounts, loadCategories]);

  /*
   * Sort transactions:
   *
   * Newest
   *   ↓
   * Oldest
   */
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) =>
        new Date(b.transaction_date).getTime() -
        new Date(a.transaction_date).getTime()
    );
  }, [transactions]);

  /*
   * Search
   *
   * Filtering by:
   * - category
   * - account
   * - note
   *
   * Actual advanced filtering will be added later.
   */
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

  /*
   * Grouping is intentionally NOT implemented yet.
   *
   * We can later add:
   *
   * TODAY
   * ├── transaction
   * └── transaction
   *
   * YESTERDAY
   * ├── transaction
   *
   * 06 AUG 2026
   * └── transaction
   *
   * without changing the transaction card.
   */

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
      const title = formatSectionTitle(transaction.transaction_date);
      const lastSection = sections[sections.length - 1];

      if (lastSection && lastSection.title === title) {
        lastSection.data.push(transaction);
      } else {
        sections.push({ title, data: [transaction] });
      }
    });

    return sections;
  }, [filteredTransactions]);

  const renderTransaction = ({
    item,
  }: {
    item: (typeof filteredTransactions)[number];
  }) => {
    const cardTransaction: {
      id: string;
      amount: number;
      type: "income" | "expense";
      date: string;
      note?: string;
      categoryId?: string;
      accountId?: string;
    } = {
      id: item.id.toString(),
      amount: item.amount,
      type: item.type === "income" ? "income" : "expense",
      date: item.transaction_date,
      note: item.note ?? undefined,
      categoryId: item.category_id.toString(),
      accountId: item.account_id.toString(),
    };

    return (
      <TransactionCard
        transaction={cardTransaction}
        categoryName={getCategoryName(item.category_id)}
        accountName={getAccountName(item.account_id)}
        onPress={() => {
          // Transaction details/edit screen will be added later.
        }}
      />
    );
  };

  return (
    <View style={styles.container}>

      {/* Search + Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#8C8C8C"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search transactions"
            placeholderTextColor="#9B9B9B"
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
                size={19}
                color="#A5A5A5"
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.75}
          onPress={() => {
            // Filter functionality will be added later.
          }}
        >
          <Ionicons
            name="options-outline"
            size={21}
            color="#222222"
          />
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      <SectionList
        sections={transactionSections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTransaction}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>
              {title}
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="receipt-outline"
                size={30}
                color="#8B8B8B"
              />
            </View>

            <Text style={styles.emptyTitle}>
              {search
                ? "No transactions found"
                : "No transactions yet"}
            </Text>

            <Text style={styles.emptyDescription}>
              {search
                ? "Try searching for a different category, account or note."
                : "Your transactions will appear here once you add one."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",

    padding: 16,
  },

  header: {
    paddingTop: 18,
    paddingBottom: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#171717",
  },

  subtitle: {
    fontSize: 13,
    color: "#8A8A8A",

    marginTop: 3,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 16,
  },

  searchContainer: {
    flex: 1,

    height: 48,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 14,

    paddingHorizontal: 14,

    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  searchInput: {
    flex: 1,

    fontSize: 14,
    color: "#171717",

    marginLeft: 9,

    paddingVertical: 0,
  },

  filterButton: {
    width: 48,
    height: 48,

    marginLeft: 9,

    borderRadius: 14,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  listContent: {
    paddingTop: 2,
    paddingBottom: 30,
  },

  sectionHeader: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 14,
    marginBottom: 8,
  },

  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333333",
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyContainer: {
    alignItems: "center",

    paddingHorizontal: 30,
  },

  emptyIconContainer: {
    width: 64,
    height: 64,

    borderRadius: 20,

    backgroundColor: "#ECECEC",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#222222",

    marginBottom: 6,
  },

  emptyDescription: {
    fontSize: 13,
    lineHeight: 19,

    textAlign: "center",

    color: "#8A8A8A",
  },
});