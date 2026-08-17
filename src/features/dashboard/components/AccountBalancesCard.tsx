import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from "react-native";
import { Account } from "@/features/accounts/types/account";

type Props = {
  accounts: Account[];
};

function formatCurrency(
  value: number,
  currency: string
) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency || "₹"} ${value.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  }
}

function getAccountIndicatorStyle(account: Account) {
  if (account.color) {
    return {
      backgroundColor: account.color,
    };
  }

  return styles.defaultDot;
}

export default function AccountsBalancesCard({
  accounts,
}: Props) {
  const router = useRouter();

  const visibleAccounts = accounts.slice(0, 5);

  const handleViewAllAccounts = () => {
    router.push("/settings/accounts");
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.cardTitle}>
            Accounts
          </Text>

          <Text style={styles.subtitle}>
            Your balances across all accounts
          </Text>
        </View>

        <Text style={styles.accountCount}>
          {visibleAccounts.length}
        </Text>
      </View>

      {/* Accounts */}
      {visibleAccounts.length > 0 ? (
        <View style={styles.list}>
          {visibleAccounts.map((account, index) => {
            const balance = account.current_balance;

            return (
              <Pressable
                key={account.id}
                style={({ pressed }) => [
                  styles.accountRow,
                  pressed && styles.accountPressed,
                  index !== visibleAccounts.length - 1 &&
                    styles.accountWithBorder,
                ]}
                onPress={() => {}}
                android_ripple={{
                  color: "#F1F5F9",
                }}
              >
                {/* Left */}
                <View style={styles.accountLeft}>
                  <View
                    style={[
                      styles.dot,
                      getAccountIndicatorStyle(account),
                    ]}
                  />

                  <View style={styles.accountInfo}>
                    <Text
                      style={styles.accountName}
                      numberOfLines={1}
                    >
                      {account.name}
                    </Text>

                    <Text
                      style={styles.accountDetails}
                      numberOfLines={1}
                    >
                      {account.type}
                    </Text>
                  </View>
                </View>

                {/* Balance */}
                <Text
                  style={[
                    styles.accountBalance,
                    balance < 0 && styles.negativeBalance,
                  ]}
                  numberOfLines={1}
                >
                  {formatCurrency(
                    balance,
                    account.currency
                  )}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        /* Empty State */
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            No accounts yet
          </Text>

          <Text style={styles.emptySubtitle}>
            Add an account to see your balance in one place.
          </Text>
        </View>
      )}

      {/* View All / Add Account */}
      {visibleAccounts.length > 0 ? (
        <Pressable
          style={({ pressed }) => [
            styles.actionRow,
            pressed && styles.actionPressed,
          ]}
          onPress={handleViewAllAccounts}
        >
          <Text style={styles.actionText}>
            View all accounts
          </Text>

          <Ionicons
            name="chevron-forward"
            size={14}
            color="#2563EB"
            style={styles.actionArrow}
          />
        </Pressable>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.actionRow,
            pressed && styles.actionPressed,
          ]}
          onPress={handleViewAllAccounts}
        >
          <Text style={styles.actionText}>
            + Add account
          </Text>
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
    marginBottom: 24,

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
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
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

  accountCount: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 7,

    borderRadius: 8,

    backgroundColor: "#F1F5F9",

    textAlign: "center",
    textAlignVertical: "center",

    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },

  /* Account list */

  list: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  accountRow: {
    minHeight: 68,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingVertical: 12,
  },

  accountWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  accountPressed: {
    opacity: 0.65,
  },

  /* Left side */

  accountLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,

    marginRight: 12,
  },

  defaultDot: {
    backgroundColor: "#16A34A",
  },

  accountInfo: {
    flex: 1,
    minWidth: 0,
  },

  accountName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  accountDetails: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 3,
  },

  /* Balance */

  accountBalance: {
    marginLeft: 12,

    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.2,

    color: "#111827",
    flexShrink: 0,
  },

  negativeBalance: {
    color: "#DC2626",
  },

  /* Empty state */

  emptyState: {
    paddingVertical: 28,
    paddingHorizontal: 12,

    alignItems: "center",

    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  emptySubtitle: {
    maxWidth: 260,

    marginTop: 5,

    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",

    color: "#9CA3AF",
  },

  /* Action */

  actionRow: {
    minHeight: 44,

    marginTop: 8,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: 12,
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