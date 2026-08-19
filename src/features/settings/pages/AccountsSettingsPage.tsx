import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AccountFormModal from "../components/AccountFormModal";

import { Ionicons } from "@expo/vector-icons";

import { Colors, ACCOUNT_COLORS } from "../../../theme/colors";
import { Spacing } from "../../../theme/spacing";
import { Typography } from "../../../theme/typography";

import { useAccountStore } from "../../accounts/stores/accountStore";

const CURRENCIES = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "AUD",
  "CAD",
  "SGD",
  "AED",
  "JPY",
];

export default function AccountsSettingsPage() {
  const accounts = useAccountStore((state) => state.accounts);
  const loadAccounts = useAccountStore((state) => state.loadAccounts);

  const addAccount = useAccountStore((state) => state.addAccount);
  const updateAccount = useAccountStore((state) => state.updateAccount);
  const deleteAccount = useAccountStore((state) => state.deleteAccount);

  const [editingAccountId, setEditingAccountId] = useState<number | null>(
    null
  );

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [openingBalance, setOpeningBalance] = useState("");
  const [selectedColor, setSelectedColor] = useState(ACCOUNT_COLORS[0]);

  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const isEditing = editingAccountId !== null;

  const resetForm = () => {
    setName("");
    setType("");
    setCurrency("INR");
    setOpeningBalance("");
    setSelectedColor(ACCOUNT_COLORS[0]);
    setShowCurrencyDropdown(false);
  };

  const openAddModal = () => {
    resetForm();
    setEditingAccountId(null);
    setIsModalVisible(true);
  };

  const openEditModal = (account: (typeof accounts)[number]) => {
    setEditingAccountId(account.id);
    setName(account.name);
    setType(account.type);
    setCurrency(account.currency);
    setOpeningBalance(
      account.opening_balance !== undefined &&
        account.opening_balance !== null
        ? String(account.opening_balance)
        : ""
    );
    setSelectedColor(account.color ?? ACCOUNT_COLORS[0]);
    setShowCurrencyDropdown(false);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    if (isSaving) return;

    setIsModalVisible(false);
    setShowCurrencyDropdown(false);
    setEditingAccountId(null);
  };

  const handleSaveAccount = async () => {
    const trimmedName = name.trim();
    const trimmedType = type.trim();

    if (!trimmedName) {
      Alert.alert("Account name required", "Please enter an account name.");
      return;
    }

    if (!trimmedType) {
      Alert.alert(
        "Account type required",
        "Please enter a type such as Bank, Cash, or Wallet."
      );
      return;
    }

    const parsedBalance = Number(openingBalance || 0);

    if (Number.isNaN(parsedBalance)) {
      Alert.alert("Invalid balance", "Please enter a valid amount.");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        name: trimmedName,
        type: trimmedType,
        currency,
        opening_balance: parsedBalance,
        color: selectedColor,
        icon: null,
      };

      if (editingAccountId === null) {
        await addAccount(payload);
      } else {
        await updateAccount(editingAccountId, payload);
      }

      setIsModalVisible(false);
      setEditingAccountId(null);
      resetForm();

      await loadAccounts();
    } catch {
      Alert.alert(
        "Couldn't save account",
        "Something went wrong. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = (
    accountId: number,
    accountName: string
  ) => {
    Alert.alert(
      "Delete account?",
      `"${accountName}" will be removed from your accounts.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount(accountId);
              await loadAccounts();
            } catch {
              Alert.alert(
                "Couldn't delete account",
                "Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const activeAccounts = accounts.filter(
    (account) => !account.is_archived
  );

  const archivedAccounts = accounts.filter(
    (account) => account.is_archived
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            Manage the accounts you use for tracking transactions.
          </Text>
        </View>

        {accounts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="wallet-outline"
                size={25}
                color={Colors.textSecondary}
              />
            </View>

            <Text style={styles.emptyTitle}>No accounts yet</Text>

            <Text style={styles.emptyDescription}>
              Add a bank account, cash wallet, or another account
              to get started.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.emptyAddButton,
                pressed && styles.emptyAddButtonPressed,
              ]}
              onPress={openAddModal}
            >
              <Ionicons name="add" size={19} color="#FFFFFF" />

              <Text style={styles.emptyAddButtonText}>
                Add account
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            {activeAccounts.length > 0 && (
              <View style={styles.accountSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Active Accounts</Text>

                  <Text style={styles.accountCount}>
                    {activeAccounts.length}
                  </Text>
                </View>

                <View style={styles.accountList}>
                  {activeAccounts.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      onPress={() => openEditModal(account)}
                      onDelete={() =>
                        handleDeleteAccount(account.id, account.name)
                      }
                    />
                  ))}
                </View>
              </View>
            )}

            {archivedAccounts.length > 0 && (
              <View style={styles.archivedSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Archived</Text>

                  <Text style={styles.accountCount}>
                    {archivedAccounts.length}
                  </Text>
                </View>

                <View style={styles.accountList}>
                  {archivedAccounts.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      archived
                      onPress={() => openEditModal(account)}
                      onDelete={() =>
                        handleDeleteAccount(account.id, account.name)
                      }
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {accounts.length > 0 && (
        <View style={styles.bottomAction}>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={openAddModal}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />

            <Text style={styles.addButtonText}>
              Add account
            </Text>
          </Pressable>
        </View>
      )}

      <AccountFormModal
        visible={isModalVisible}
        isEditing={isEditing}
        isSaving={isSaving}
        name={name}
        type={type}
        currency={currency}
        openingBalance={openingBalance}
        selectedColor={selectedColor}
        showCurrencyDropdown={showCurrencyDropdown}
        onNameChange={setName}
        onTypeChange={setType}
        onCurrencyChange={(value) => {
          setCurrency(value);
          setShowCurrencyDropdown(false);
        }}
        onOpeningBalanceChange={setOpeningBalance}
        onColorChange={setSelectedColor}
        onToggleCurrencyDropdown={() =>
          setShowCurrencyDropdown(
            (previous) => !previous
          )
        }
        onClose={closeModal}
        onSave={handleSaveAccount}
      />
    </View>
  );
}

function AccountCard({
  account,
  archived = false,
  onPress,
  onDelete,
}: {
  account: any;
  archived?: boolean;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.accountCard,
        archived && styles.archivedAccountCard,
        pressed && styles.accountCardPressed,
      ]}
      onPress={onPress}
      android_ripple={{
        color: "rgba(0, 0, 0, 0.035)",
      }}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.accountIdentity}>
          <View
            style={[
              styles.accountColor,
              {
                backgroundColor:
                  account.color ?? Colors.textSecondary,
              },
              archived && styles.archivedAccountColor,
            ]}
          />

          <View style={styles.accountIdentityText}>
            <Text
              style={[
                styles.accountName,
                archived && styles.archivedAccountName,
              ]}
              numberOfLines={1}
            >
              {account.name}
            </Text>

            <View style={styles.accountMeta}>
              <Text
                style={[
                  styles.accountType,
                  archived && styles.archivedText,
                ]}
              >
                {account.type}
              </Text>

              <View
                style={[
                  styles.metaDot,
                  archived && styles.archivedDot,
                ]}
              />

              <Text
                style={[
                  styles.accountCurrency,
                  archived && styles.archivedText,
                ]}
              >
                {account.currency}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.deleteButtonPressed,
          ]}
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${account.name}`}
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color="#D9534F"
          />
        </Pressable>
      </View>
      
      <View style={styles.balanceRow}>
        <View style={styles.currentBalanceColumn}>
          <Text
            style={[
              styles.balanceLabel,
              styles.currentBalanceLabel,
              archived && styles.archivedText,
            ]}
          >
            Current
          </Text>

          <Text
            style={[
              styles.balanceValue,
              styles.currentBalanceValue,
              archived && styles.archivedBalance,
            ]}
            numberOfLines={1}
          >
            {formatBalance(account.current_balance, account.currency)}
          </Text>
        </View>

        <View style={styles.openingBalanceColumn}>
          <Text
            style={[
              styles.balanceLabel,
              styles.openingBalanceLabel,
              archived && styles.archivedText,
            ]}
          >
            Opening
          </Text>

          <Text
            style={[
              styles.balanceValue,
              styles.openingBalanceValue,
              archived && styles.archivedBalance,
            ]}
            numberOfLines={1}
          >
            {formatBalance(
              account.opening_balance,
              account.currency
            )}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function formatBalance(
  amount: number,
  currency: string
) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: Spacing.lg,
    paddingBottom: 110,
  },

  header: {
    marginBottom: Spacing.xl,
  },

  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  /* Empty state */

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 55,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.04)",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 7,
  },

  emptyDescription: {
    maxWidth: 310,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
    marginBottom: 22,
  },

  emptyAddButton: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: Colors.primary ?? "#4F46E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  emptyAddButtonPressed: {
    opacity: 0.85,
  },

  emptyAddButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  /* Account section */

  accountSection: {
    marginTop: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 0.6,
  },

  accountCount: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: 12,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.05)",
  },

  archivedSection: {
    marginTop: 28,
  },

  accountList: {
    gap: 10,
  },

  /* Account card */

  accountCard: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.025)",
    borderWidth: 1,
    borderColor:
      Colors.border ?? "rgba(0, 0, 0, 0.08)",
  },

  accountCardPressed: {
    opacity: 0.78,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  accountIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  accountColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 11,
  },

  accountIdentityText: {
    flex: 1,
    minWidth: 0,
  },

  accountName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },

  accountMeta: {
    flexDirection: "row",
    alignItems: "center",
  },

  accountType: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.textSecondary,
    marginHorizontal: 7,
    opacity: 0.55,
  },

  accountCurrency: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },

  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  deleteButtonPressed: {
    backgroundColor: "rgba(217, 83, 79, 0.10)",
  },

  /* Balances */
  balanceRow: {
    flexDirection: "row",
    marginTop: 17,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor:
      Colors.border ?? "rgba(0, 0, 0, 0.08)",
  },

  balanceColumn: {
    flex: 1,
  },

  currentBalanceColumn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor:
      Colors.background ?? "rgba(0, 0, 0, 0.025)",
  },

  openingBalanceColumn: {
    flex: 1,
    alignItems: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  balanceLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.45,
    marginBottom: 4,
  },

  currentBalanceLabel: {
    color: Colors.text,
  },

  openingBalanceLabel: {
    color: Colors.textSecondary,
    opacity: 0.75,
  },

  balanceValue: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },

  currentBalanceValue: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
  },

  openingBalanceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    opacity: 0.8,
  },

  /* Archived */

  archivedAccountCard: {
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.018)",
    borderColor:
      Colors.border ?? "rgba(0, 0, 0, 0.055)",
  },

  archivedAccountColor: {
    opacity: 0.45,
  },

  archivedAccountName: {
    color: Colors.textSecondary,
  },

  archivedText: {
    opacity: 0.65,
  },

  archivedDot: {
    opacity: 0.3,
  },

  archivedBalance: {
    color: Colors.textSecondary,
  },

  /* Bottom action */

  bottomAction: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: 12,
    paddingBottom:
      Platform.OS === "ios" ? Spacing.xl : Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor:
      Colors.border ?? "rgba(0, 0, 0, 0.08)",
  },

  addButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: Colors.primary ?? "#4F46E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  addButtonPressed: {
    opacity: 0.86,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});