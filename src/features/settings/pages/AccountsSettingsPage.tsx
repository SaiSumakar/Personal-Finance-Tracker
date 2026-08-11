import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Simple page intro */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            Manage the accounts you use for tracking transactions.
          </Text>
        </View>

        {/* Accounts */}
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
            {/* Active accounts */}
            <View style={styles.accountSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Accounts</Text>

                <Text style={styles.accountCount}>
                  {accounts.filter((account) => !account.is_archived).length}
                </Text>
              </View>

              <View style={styles.accountList}>
                {accounts
                  .filter((account) => !account.is_archived)
                  .map((account) => (
                    <Pressable
                      key={account.id}
                      style={({ pressed }) => [
                        styles.accountCard,
                        pressed && styles.accountCardPressed,
                      ]}
                      onPress={() => openEditModal(account)}
                      android_ripple={{
                        color: "rgba(0, 0, 0, 0.035)",
                      }}
                    >
                      <View
                        style={[
                          styles.accountAccent,
                          {
                            backgroundColor:
                              account.color ?? Colors.textSecondary,
                          },
                        ]}
                      />

                      <View style={styles.accountContent}>
                        <View style={styles.accountDetails}>
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

                            <View style={styles.metaDot} />

                            <Text style={styles.accountCurrency}>
                              {account.currency}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.accountAmount}>
                          <Text style={styles.balance}>
                            {formatBalance(
                              account.opening_balance,
                              account.currency
                            )}
                          </Text>

                          <Text style={styles.balanceCaption}>
                            opening balance
                          </Text>
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

                          handleDeleteAccount(
                            account.id,
                            account.name
                          );
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
                    </Pressable>
                  ))}
              </View>
            </View>

            {/* Archived accounts */}
            {accounts.some((account) => account.is_archived) && (
              <View style={styles.archivedSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Archived
                  </Text>

                  <Text style={styles.accountCount}>
                    {accounts.filter(
                      (account) => account.is_archived
                    ).length}
                  </Text>
                </View>

                <View style={styles.accountList}>
                  {accounts
                    .filter((account) => account.is_archived)
                    .map((account) => (
                      <Pressable
                        key={account.id}
                        style={({ pressed }) => [
                          styles.accountCard,
                          styles.archivedAccountCard,
                          pressed && styles.accountCardPressed,
                        ]}
                        onPress={() => openEditModal(account)}
                        android_ripple={{
                          color: "rgba(0, 0, 0, 0.025)",
                        }}
                      >
                        <View
                          style={[
                            styles.accountAccent,
                            styles.archivedAccent,
                            {
                              backgroundColor:
                                account.color ??
                                Colors.textSecondary,
                            },
                          ]}
                        />

                        <View style={styles.accountContent}>
                          <View style={styles.accountDetails}>
                            <Text
                              style={[
                                styles.accountName,
                                styles.archivedAccountName,
                              ]}
                              numberOfLines={1}
                            >
                              {account.name}
                            </Text>

                            <View style={styles.accountMeta}>
                              <Text
                                style={[
                                  styles.accountType,
                                  styles.archivedText,
                                ]}
                              >
                                {account.type}
                              </Text>

                              <View
                                style={[
                                  styles.metaDot,
                                  styles.archivedDot,
                                ]}
                              />

                              <Text
                                style={[
                                  styles.accountCurrency,
                                  styles.archivedText,
                                ]}
                              >
                                {account.currency}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.accountAmount}>
                            <Text
                              style={[
                                styles.balance,
                                styles.archivedBalance,
                              ]}
                            >
                              {formatBalance(
                                account.opening_balance,
                                account.currency
                              )}
                            </Text>

                            <Text
                              style={[
                                styles.balanceCaption,
                                styles.archivedText,
                              ]}
                            >
                              opening balance
                            </Text>
                          </View>

                          <Ionicons
                            name="chevron-forward"
                            size={17}
                            color={Colors.textSecondary}
                            style={[
                              styles.chevron,
                              styles.archivedChevron,
                            ]}
                          />
                        </View>

                        <Pressable
                          style={({ pressed }) => [
                            styles.deleteButton,
                            pressed && styles.deleteButtonPressed,
                          ]}
                          hitSlop={8}
                          onPress={(event) => {
                            event.stopPropagation();

                            handleDeleteAccount(
                              account.id,
                              account.name
                            );
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Delete ${account.name}`}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={17}
                            color="#D9534F"
                          />
                        </Pressable>
                      </Pressable>
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

      {/* Add / Edit modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeModal}
          />

          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>
                  {isEditing ? "Edit account" : "Add account"}
                </Text>

                <Text style={styles.modalSubtitle}>
                  {isEditing
                    ? "Update your account details."
                    : "Enter the details for your new account."}
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed,
                ]}
                onPress={closeModal}
                hitSlop={8}
              >
                <Ionicons
                  name="close"
                  size={21}
                  color={Colors.text}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.formContent}
            >
              <View style={styles.field}>
                <Text style={styles.label}>Name</Text>

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. HDFC Bank"
                  placeholderTextColor={Colors.textSecondary}
                  style={styles.input}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Type</Text>

                <TextInput
                  value={type}
                  onChangeText={setType}
                  placeholder="e.g. Bank, Cash, Wallet"
                  placeholderTextColor={Colors.textSecondary}
                  style={styles.input}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.formRow}>
                <View
                  style={[
                    styles.field,
                    styles.currencyField,
                  ]}
                >
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
                        const isSelected =
                          item === currency;

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
                                color={
                                  Colors.primary ??
                                  "#4F46E5"
                                }
                              />
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>

                <View
                  style={[
                    styles.field,
                    styles.balanceField,
                  ]}
                >
                  <Text style={styles.label}>
                    Opening balance
                  </Text>

                  <View
                    style={styles.balanceInputWrapper}
                  >
                    <Text style={styles.currencyPrefix}>
                      {currency}
                    </Text>

                    <TextInput
                      value={openingBalance}
                      onChangeText={setOpeningBalance}
                      placeholder="0.00"
                      placeholderTextColor={
                        Colors.textSecondary
                      }
                      style={styles.balanceInput}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Color</Text>

                <View style={styles.colorGrid}>
                  {ACCOUNT_COLORS.map((color) => {
                    const isSelected =
                      selectedColor === color;

                    return (
                      <Pressable
                        key={color}
                        style={({ pressed }) => [
                          styles.colorOptionOuter,
                          isSelected &&
                            styles.colorOptionSelected,
                          pressed &&
                            styles.colorOptionPressed,
                        ]}
                        onPress={() =>
                          setSelectedColor(color)
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`Select color ${color}`}
                      >
                        <View
                          style={[
                            styles.colorOption,
                            {
                              backgroundColor: color,
                            },
                          ]}
                        />

                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#FFFFFF"
                            style={styles.colorCheck}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.modalSaveButton,
                  pressed && styles.modalSaveButtonPressed,
                  isSaving &&
                    styles.modalSaveButtonDisabled,
                ]}
                onPress={handleSaveAccount}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                    <Text style={styles.modalSaveButtonText}>
                      {isEditing
                        ? "Saving..."
                        : "Adding..."}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.modalSaveButtonText}>
                    {isEditing
                      ? "Save changes"
                      : "Add account"}
                  </Text>
                )}
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

  /* Page intro */

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
  textTransform: "uppercase",
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

accountCard: {
  minHeight: 82,
  borderRadius: 16,
  backgroundColor:
    Colors.surface ?? "rgba(0, 0, 0, 0.025)",
  borderWidth: 1,
  borderColor:
    Colors.border ?? "rgba(0, 0, 0, 0.08)",
  flexDirection: "row",
  alignItems: "center",
  overflow: "hidden",
},

accountCardPressed: {
  opacity: 0.78,
},

accountAccent: {
  width: 4,
  alignSelf: "stretch",
},

accountContent: {
  flex: 1,
  minWidth: 0,
  flexDirection: "row",
  alignItems: "center",
  paddingLeft: 14,
  paddingVertical: 14,
},

accountDetails: {
  flex: 1,
  minWidth: 0,
  paddingRight: 10,
},

accountName: {
  fontSize: 15,
  fontWeight: "700",
  color: Colors.text,
  marginBottom: 5,
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
  opacity: 0.6,
},

accountCurrency: {
  fontSize: 12,
  fontWeight: "600",
  color: Colors.textSecondary,
},

accountAmount: {
  alignItems: "flex-end",
},

balance: {
  fontSize: 14,
  fontWeight: "700",
  color: Colors.text,
},

balanceCaption: {
  fontSize: 10,
  color: Colors.textSecondary,
  marginTop: 3,
},

chevron: {
  marginHorizontal: 5,
  opacity: 0.5,
},

/* Archived */

  archivedAccountCard: {
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.018)",
    borderColor:
      Colors.border ?? "rgba(0, 0, 0, 0.055)",
  },

  archivedAccent: {
    opacity: 0.45,
  },

  archivedAccountName: {
    color: Colors.textSecondary,
  },

  archivedText: {
    opacity: 0.7,
  },

  archivedDot: {
    opacity: 0.35,
  },

  archivedBalance: {
    color: Colors.textSecondary,
  },

  archivedChevron: {
    opacity: 0.3,
  },

  deleteButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  deleteButtonPressed: {
    backgroundColor: "rgba(217, 83, 79, 0.10)",
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
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: "92%",
    paddingTop: 8,
    overflow: "hidden",
  },

  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 4,
    alignSelf: "center",
    backgroundColor: Colors.textSecondary,
    opacity: 0.3,
    marginBottom: 15,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingBottom: 17,
  },

  modalHeaderText: {
    flex: 1,
    paddingRight: 12,
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
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.05)",
  },

  closeButtonPressed: {
    opacity: 0.6,
  },

  formContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 2,
    paddingBottom: 34,
  },

  /* Form */

  field: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor:
      Colors.border ?? "rgba(0, 0, 0, 0.11)",
    borderRadius: 13,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.text,
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.025)",
  },

  /* Currency / balance */

  formRow: {
    flexDirection: "row",
    gap: 12,
  },

  currencyField: {
    flex: 0.85,
    minWidth: 0,
  },

  balanceField: {
    flex: 1.15,
    minWidth: 0,
  },

  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownValue: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "600",
  },

  dropdownMenu: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 78,
    zIndex: 20,
    borderWidth: 1,
    borderColor:
      Colors.border ?? "rgba(0, 0, 0, 0.11)",
    borderRadius: 13,
    overflow: "hidden",
    backgroundColor: Colors.background,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 7,
  },

  currencyOption: {
    minHeight: 44,
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
      Colors.surface ?? "rgba(0, 0, 0, 0.035)",
  },

  currencyOptionText: {
    fontSize: 14,
    color: Colors.text,
  },

  currencyOptionTextSelected: {
    fontWeight: "700",
  },

  balanceInputWrapper: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor:
      Colors.border ?? "rgba(0, 0, 0, 0.11)",
    borderRadius: 13,
    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.025)",
  },

  currencyPrefix: {
    paddingLeft: 13,
    paddingRight: 5,
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
  },

  balanceInput: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 4,
    fontSize: 15,
    color: Colors.text,
  },

  /* Color */

  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 13,
  },

  colorOptionOuter: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  colorOptionSelected: {
    borderWidth: 2,
    borderColor: Colors.text,
  },

  colorOptionPressed: {
    opacity: 0.7,
  },

  colorOption: {
    width: 28,
    height: 28,
    borderRadius: 9,
  },

  colorCheck: {
    position: "absolute",
  },

  /* Modal CTA */

  modalSaveButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: Colors.primary ?? "#4F46E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 3,
  },

  modalSaveButtonPressed: {
    opacity: 0.86,
  },

  modalSaveButtonDisabled: {
    opacity: 0.55,
  },

  modalSaveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});