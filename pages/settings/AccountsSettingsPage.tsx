import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Colors, ACCOUNT_COLORS } from "../../constants/colors";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";

import { useAccountStore } from "../../stores/accountStore";

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

  // Change this if your store uses a different action name.
  const addAccount = useAccountStore((state) => state.addAccount);
  const updateAccount = useAccountStore((state) => state.updateAccount);
  const deleteAccount = useAccountStore((state) => state.deleteAccount);

  const [editingAccountId, setEditingAccountId] = useState<number | null>(null);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

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
    setIsAddModalVisible(true);
  };

  const openEditModal = (account: (typeof accounts)[number]) => {
    setEditingAccountId(account.id);

    setName(account.name);
    setType(account.type);
    setCurrency(account.currency);

    // Keep these at their current/default values for now.
    // We are not editing them yet.
    setOpeningBalance("");
    setSelectedColor(account.color ?? ACCOUNT_COLORS[0]);

    setShowCurrencyDropdown(false);
    setIsAddModalVisible(true);
  };

  const closeAddModal = () => {
    if (isSaving) {
      return;
    }

    setIsAddModalVisible(false);
    setShowCurrencyDropdown(false);
    setEditingAccountId(null);
  };

  const handleSaveAccount = async () => {
    const trimmedName = name.trim();
    const trimmedType = type.trim();

    if (!trimmedName) {
      Alert.alert("Missing name", "Please enter an account name.");
      return;
    }

    if (!trimmedType) {
      Alert.alert("Missing type", "Please enter an account type.");
      return;
    }

    try {
      setIsSaving(true);

      if (editingAccountId === null) {
        // ADD
        await addAccount({
          name: trimmedName,
          type: trimmedType,
          currency,
          opening_balance: Number(openingBalance || 0),
          color: selectedColor,
          icon: null,
        });
      } else {
        // EDIT
        await updateAccount(editingAccountId, {
          name: trimmedName,
          type: trimmedType,
          currency,
          opening_balance: Number(openingBalance || 0),
          color: selectedColor,
          icon: null,
        });
      }

      setIsAddModalVisible(false);
      setEditingAccountId(null);
      resetForm();

      await loadAccounts();
    } catch (error) {
      Alert.alert(
        "Couldn't save account",
        "Something went wrong while saving the account."
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
      `Are you sure you want to delete "${accountName}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteAccount(accountId);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>

          <Text style={styles.subtitle}>
            Manage your accounts used for tracking transactions.
          </Text>
        </View>

        {accounts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="wallet-outline"
                size={23}
                color={Colors.textSecondary}
              />
            </View>

            <Text style={styles.emptyTitle}>No accounts yet</Text>

            <Text style={styles.emptyDescription}>
              Add accounts to get started
            </Text>
          </View>
        ) : (
          <View style={styles.accountList}>
            {accounts.map((account) => (
              <Pressable
                style={styles.accountInfo}
                onPress={() => openEditModal(account)}
                android_ripple={{ color: "rgba(0, 0, 0, 0.04)" }}
                key={account.id}
              >
                <View style={styles.accountRow}>
                  <View
                    style={[
                      styles.accountIndicator,
                      {
                        backgroundColor:
                          account.color ?? Colors.textSecondary,
                      },
                    ]}
                  />

                  <View style={styles.accountInfo}>
                    <Text
                      style={styles.accountName}
                      numberOfLines={1}
                    >
                      {account.name}
                    </Text>

                    <View style={styles.accountMeta}>
                      <Text style={styles.accountType}>
                        {account.type}
                      </Text>

                      <Text style={styles.metaSeparator}>·</Text>

                      <Text style={styles.accountCurrency}>
                        {account.currency}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.accountRight}>
                    <Text style={styles.balance}>
                      {formatBalance(
                        account.opening_balance,
                        account.currency
                      )}
                    </Text>

                    <Pressable
                      style={({ pressed }) => [
                        styles.deleteButton,
                        pressed && styles.deleteButtonPressed,
                      ]}
                      hitSlop={8}
                      onPress={() =>
                        handleDeleteAccount(
                          account.id,
                          account.name
                        )
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${account.name}`}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={19}
                        color="#D9534F"
                      />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Fixed add button */}
      <View style={styles.bottomAction}>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={openAddModal}
        >
          <Ionicons name="add" size={21} color="#FFFFFF" />

          <Text style={styles.addButtonText}>
            Add account
          </Text>
        </Pressable>
      </View>

      {/* Add Account Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeAddModal}
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeAddModal}
          />

          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingAccountId === null
                    ? "Add account"
                    : "Edit account"}
                </Text>

                <Text style={styles.modalSubtitle}>
                  {editingAccountId === null
                    ? "Add an account to start tracking transactions."
                    : "Update your account details."}
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={closeAddModal}
                hitSlop={8}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={Colors.textSecondary}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.formContent}
            >
              {/* Name */}
              <View style={styles.field}>
                <Text style={styles.label}>Name</Text>

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. HDFC Bank"
                  placeholderTextColor={Colors.textSecondary}
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              {/* Type */}
              <View style={styles.field}>
                <Text style={styles.label}>Type</Text>

                <TextInput
                  value={type}
                  onChangeText={setType}
                  placeholder="e.g. Bank, Cash, Wallet"
                  placeholderTextColor={Colors.textSecondary}
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              {/* Currency */}
              <View style={styles.field}>
                <Text style={styles.label}>Currency</Text>

                <Pressable
                  style={[
                    styles.input,
                    styles.dropdownButton,
                  ]}
                  onPress={() =>
                    setShowCurrencyDropdown(
                      (previous) => !previous
                    )
                  }
                >
                  <Text style={styles.dropdownValue}>
                    {currency}
                  </Text>

                  <Ionicons
                    name={
                      showCurrencyDropdown
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={18}
                    color={Colors.textSecondary}
                  />
                </Pressable>

                {showCurrencyDropdown && (
                  <View style={styles.dropdownMenu}>
                    {CURRENCIES.map((item) => {
                      const isSelected = item === currency;

                      return (
                        <Pressable
                          key={item}
                          style={({ pressed }) => [
                            styles.currencyOption,
                            pressed &&
                              styles.currencyOptionPressed,
                            isSelected &&
                              styles.currencyOptionSelected,
                          ]}
                          onPress={() => {
                            setCurrency(item);
                            setShowCurrencyDropdown(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.currencyOptionText,
                              isSelected &&
                                styles.currencyOptionTextSelected,
                            ]}
                          >
                            {item}
                          </Text>

                          {isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color={Colors.text}
                            />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Opening balance */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  Opening balance
                </Text>

                <View style={styles.balanceInputWrapper}>
                  <Text style={styles.currencyPrefix}>
                    {currency}
                  </Text>

                  <TextInput
                    value={openingBalance}
                    onChangeText={setOpeningBalance}
                    placeholder="0.00"
                    placeholderTextColor={Colors.textSecondary}
                    style={styles.balanceInput}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                  />
                </View>
              </View>

              {/* Color */}
              <View style={styles.field}>
                <Text style={styles.label}>Color</Text>

                <View style={styles.colorGrid}>
                  {ACCOUNT_COLORS.map((color) => {
                    const isSelected =
                      selectedColor === color;

                    return (
                      <Pressable
                        key={color}
                        style={[
                          styles.colorOption,
                          {
                            backgroundColor: color,
                          },
                          isSelected &&
                            styles.colorOptionSelected,
                        ]}
                        onPress={() =>
                          setSelectedColor(color)
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`Select color ${color}`}
                      >
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color="#FFFFFF"
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Add */}
              <Pressable
                style={({ pressed }) => [
                  styles.modalAddButton,
                  pressed &&
                    styles.modalAddButtonPressed,
                  isSaving &&
                    styles.modalAddButtonDisabled,
                ]}
                onPress={handleSaveAccount}
                disabled={isSaving}
              >
                <Text style={styles.modalAddButtonText}>
                  {isSaving
                    ? editingAccountId === null
                      ? "Adding..."
                      : "Saving..."
                    : editingAccountId === null
                      ? "Add account"
                      : "Save changes"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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

  title: {
    fontSize: Typography.title,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.sm,
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
    paddingVertical: Spacing.xxxl,
  },

  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },

  emptyTitle: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },

  emptyDescription: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },

  /* Account list */

  accountList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor:
      Colors.border ?? Colors.textSecondary,
  },

  accountRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor:
      Colors.border ?? Colors.textSecondary,
  },

  accountIndicator: {
    width: 4,
    height: 42,
    borderRadius: 2,
    marginRight: Spacing.md,
  },

  accountInfo: {
    flex: 1,
    minWidth: 0,
    paddingVertical: Spacing.md,
  },

  accountName: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },

  accountMeta: {
    flexDirection: "row",
    alignItems: "center",
  },

  accountType: {
    fontSize: 13,
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },

  metaSeparator: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginHorizontal: 6,
  },

  accountCurrency: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

  accountRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: Spacing.md,
  },

  balance: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginRight: Spacing.sm,
  },

  deleteButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
  },

  deleteButtonPressed: {
    backgroundColor: "rgba(255, 0, 0, 0.08)",
  },

  /* Fixed bottom button */

  bottomAction: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom:
      Platform.OS === "ios" ? Spacing.xl : Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor:
      Colors.border ?? Colors.textSecondary,
  },

  addButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary ?? "#4F46E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  addButtonPressed: {
    opacity: 0.85,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.body,
    fontWeight: "700",
  },

  /* Modal */

  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  modalContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    paddingTop: Spacing.sm,
  },

  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    backgroundColor: Colors.textSecondary,
    opacity: 0.4,
    marginBottom: Spacing.md,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },

  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    maxWidth: 290,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.05)",
  },

  formContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 36,
  },

  /* Form fields */

  field: {
    marginBottom: Spacing.lg,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor:
      Colors.border ?? "rgba(0, 0, 0, 0.12)",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.text,
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.025)",
  },

  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownValue: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "500",
  },

  dropdownMenu: {
    marginTop: 6,
    borderWidth: 1,
    borderColor:
      Colors.border ?? "rgba(0, 0, 0, 0.12)",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.background,
  },

  currencyOption: {
    minHeight: 46,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  currencyOptionPressed: {
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.04)",
  },

  currencyOptionSelected: {
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.04)",
  },

  currencyOptionText: {
    fontSize: 14,
    color: Colors.text,
  },

  currencyOptionTextSelected: {
    fontWeight: "600",
  },

  /* Balance */

  balanceInputWrapper: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor:
      Colors.border ?? "rgba(0, 0, 0, 0.12)",
    borderRadius: 12,
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.025)",
  },

  currencyPrefix: {
    paddingLeft: 14,
    paddingRight: 8,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },

  balanceInput: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 4,
    fontSize: 15,
    color: Colors.text,
  },

  /* Colors */

  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  colorOptionSelected: {
    borderWidth: 3,
    borderColor: Colors.background,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 3,
  },

  /* Modal add button */

  modalAddButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary ?? "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
  },

  modalAddButtonPressed: {
    opacity: 0.85,
  },

  modalAddButtonDisabled: {
    opacity: 0.5,
  },

  modalAddButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});