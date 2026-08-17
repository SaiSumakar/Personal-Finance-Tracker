import { useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  FormProvider,
  useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  transactionSchema,
  TransactionFormValues,
} from "../schemas/transactionSchema";

import TransactionTypeToggle from "./TransactionTypeToggle";
import AmountInput from "./AmountInput";
import NoteInput from "./NoteInput";

import AppSelect from "../components/form/AppSelect";
import AppDatePicker from "../components/form/AppDatePicker";

import { useTransactionStore } from "../stores/transactionStore";
import { useAccountStore } from "../../accounts/stores/accountStore";
import { useCategoryStore } from "../../categories/stores/categoryStore";

import { Colors } from "../../../theme/colors";
import { Spacing } from "../../../theme/spacing";

type Transaction = {
  id: number;
  account_id: number;
  category_id: number;
  type: "income" | "expense" | "transfer";
  amount: number;
  transaction_date: string;
  note?: string | null;
  payment_method?: string | null;
  location?: string | null;
};

type EditTransactionModalProps = {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
};

export default function EditTransactionModal({
  visible,
  transaction,
  onClose,
}: EditTransactionModalProps) {
  const updateTransaction = useTransactionStore(
    (state) => state.updateTransaction
  );

  const deleteTransaction = useTransactionStore(
    (state) => state.deleteTransaction
  )

  const transactionLoading = useTransactionStore(
    (state) => state.loading
  );

  const accounts = useAccountStore(
    (state) => state.accounts
  );

  const loadAccounts = useAccountStore(
    (state) => state.loadAccounts
  );

  const expenseCategories = useCategoryStore(
    (state) => state.expenseCategories
  );

  const incomeCategories = useCategoryStore(
    (state) => state.incomeCategories
  );

  const loadCategories = useCategoryStore(
    (state) => state.loadCategories
  );

  const methods = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),

    defaultValues: {
      type: "expense",
      amount: 0,
      category_id: 0,
      account_id: 0,
      transaction_date: new Date(),
      note: "",
      payment_method: "",
      location: "",
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
  } = methods;

  const transactionType = watch("type");
  const selectedCategory = watch("category_id");

  const categories =
    transactionType === "income"
      ? incomeCategories
      : expenseCategories;

  /*
   * Load data when the modal opens.
   */
  useEffect(() => {
    if (!visible) {
      return;
    }

    loadAccounts();
    loadCategories();
  }, [
    visible,
    loadAccounts,
    loadCategories,
  ]);

  /*
   * Populate the form whenever the selected
   * transaction changes.
   */
  useEffect(() => {
    if (!visible || !transaction) {
      return;
    }

    reset({
      type: transaction.type,
      amount: transaction.amount,
      category_id: transaction.category_id,
      account_id: transaction.account_id,
      transaction_date: new Date(
        transaction.transaction_date
      ),
      note: transaction.note ?? "",
      payment_method:
        transaction.payment_method ?? "",
      location:
        transaction.location ?? "",
    });
  }, [
    visible,
    transaction,
    reset,
  ]);

  /*
   * Make sure the selected category still belongs
   * to the current transaction type.
   */
  useEffect(() => {
    if (!visible) {
      return;
    }

    const categoryExists = categories.some(
      (category) =>
        category.id === selectedCategory
    );

    if (
      selectedCategory !== 0 &&
      !categoryExists
    ) {
      setValue("category_id", 0);
    }
  }, [
    visible,
    categories,
    selectedCategory,
    setValue,
  ]);

  const handleClose = () => {
    if (transactionLoading) {
      return;
    }

    onClose();
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete transaction?",
      "Are you sure you want to delete this transaction? This action will also update the account balance.",
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
              const result = await deleteTransaction(id);

              if (!result) {
                Alert.alert(
                  "Unable to delete",
                  "The transaction could not be deleted. Please try again."
                );

                return;
              }

              onClose();
            } catch {
              Alert.alert(
                "Couldn't delete transaction",
                "Something went wrong. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const onSubmit = async (
    data: TransactionFormValues
  ) => {
    if (!transaction) {
      return;
    }

    try {
      const result = await updateTransaction(
        transaction.id,
        {
          account_id: data.account_id,
          category_id: data.category_id,
          type: data.type,
          amount: data.amount,
          transaction_date:
            data.transaction_date.toISOString(),
          note: data.note || undefined,
          payment_method:
            data.payment_method || undefined,
          location:
            data.location || undefined,
        }
      );

      if (!result) {
        Alert.alert(
          "Unable to save",
          "The transaction could not be updated. Please try again."
        );

        return;
      }

      onClose();
    } catch {
      Alert.alert(
        "Couldn't update transaction",
        "Something went wrong. Please try again."
      );
    }
  };

  const isIncome =
    transactionType === "income";
    
  if (!transaction) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        {/* Backdrop */}
        <Pressable
          style={styles.modalBackdrop}
          onPress={handleClose}
        />

        {/* Bottom sheet */}
        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalTitle}>
                Edit transaction
              </Text>

              <Text style={styles.modalSubtitle}>
                Make your changes and save.
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              onPress={handleClose}
              disabled={transactionLoading}
              hitSlop={8}
            >
              <Ionicons
                name="close"
                size={21}
                color={Colors.text}
              />
            </Pressable>
          </View>

          <FormProvider {...methods}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.formContent}
            >
              {/* Type */}
              <View style={styles.typeSection}>
                <TransactionTypeToggle />
              </View>

              {/* Amount */}
              <View
                style={[
                  styles.amountCard,
                  isIncome &&
                    styles.amountCardIncome,
                ]}
              >
                <View style={styles.amountHeader}>
                  <View style={styles.amountHeaderText}>
                    <Text style={styles.amountLabel}>
                      {isIncome
                        ? "Income"
                        : "Expense"}
                    </Text>

                    <Text style={styles.amountHint}>
                      Transaction amount
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.amountIcon,
                      isIncome
                        ? styles.incomeIcon
                        : styles.expenseIcon,
                    ]}
                  >
                    <Text
                      style={[
                        styles.amountIconText,
                        isIncome
                          ? styles.incomeIconText
                          : styles.expenseIconText,
                      ]}
                    >
                      ₹
                    </Text>
                  </View>
                </View>

                <AmountInput />
              </View>

              {/* Details */}
              <View style={styles.detailsCard}>
                <View style={styles.field}>
                  <AppSelect
                    label="Category"
                    name="category_id"
                    control={methods.control}
                    placeholder="Select category"
                    options={categories.map(
                      (category) => ({
                        label: category.name,
                        value: category.id,
                      })
                    )}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.field}>
                  <AppSelect
                    label="Account"
                    name="account_id"
                    control={methods.control}
                    placeholder="Select account"
                    options={accounts.map(
                      (account) => ({
                        label: account.name,
                        value: account.id,
                      })
                    )}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.field}>
                  <AppDatePicker
                    label="Date"
                    name="transaction_date"
                    control={methods.control}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.noteField}>
                  <NoteInput />
                </View>
              </View>

              {/* Save */}
              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed &&
                    styles.saveButtonPressed,
                  transactionLoading &&
                    styles.saveButtonDisabled,
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={transactionLoading}
              >
                <Ionicons
                  name={
                    transactionLoading
                      ? "sync-outline"
                      : "checkmark"
                  }
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.saveButtonText}>
                  {transactionLoading
                    ? "Saving..."
                    : "Save changes"}
                </Text>
              </Pressable>

              {/* Delete */}
              <Pressable
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.deleteButtonPressed,
                  transactionLoading && styles.deleteButtonDisabled,
                ]}
                onPress={() => handleDelete(transaction.id)}
                disabled={transactionLoading}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={Colors.danger ?? "#DC2626"}
                />

                <Text style={styles.deleteButtonText}>
                  Delete transaction
                </Text>
              </Pressable>
            </ScrollView>
          </FormProvider>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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

    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    maxHeight: "90%",

    paddingTop: 7,

    overflow: "hidden",
  },

  modalHandle: {
    width: 34,
    height: 4,

    borderRadius: 4,

    alignSelf: "center",

    backgroundColor: Colors.textSecondary,
    opacity: 0.3,

    marginBottom: 8,
  },

  /* Header */

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: Spacing.lg,
    paddingBottom: 10,
  },

  modalHeaderText: {
    flex: 1,
    paddingRight: 10,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: Colors.text,
  },

  modalSubtitle: {
    marginTop: 1,

    fontSize: 11,
    color: Colors.textSecondary,
  },

  closeButton: {
    width: 34,
    height: 34,

    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      Colors.surface ?? "rgba(0, 0, 0, 0.05)",
  },

  closeButtonPressed: {
    opacity: 0.6,
  },

  /* Form */

  formContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 0,
    paddingBottom: 22,
  },

  /* Type */

  typeSection: {
    marginBottom: 8,
  },

  /* Amount */

  amountCard: {
    backgroundColor: Colors.surface,

    borderRadius: 14,

    borderWidth: 1,
    borderColor: Colors.border,

    padding: 13,

    marginBottom: 9,
  },

  amountCardIncome: {
    borderColor: Colors.successLight,
  },

  amountHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 6,
  },

  amountHeaderText: {
    flex: 1,
  },

  amountLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },

  amountHint: {
    marginTop: 1,

    fontSize: 10,
    color: Colors.textSecondary,
  },

  amountIcon: {
    width: 32,
    height: 32,

    borderRadius: 9,

    alignItems: "center",
    justifyContent: "center",
  },

  expenseIcon: {
    backgroundColor: "#EFF6FF",
  },

  incomeIcon: {
    backgroundColor: "#F0FDF4",
  },

  amountIconText: {
    fontSize: 16,
    fontWeight: "800",
  },

  expenseIconText: {
    color: Colors.primary,
  },

  incomeIconText: {
    color: Colors.success,
  },

  /* Details */

  detailsCard: {
    backgroundColor: Colors.surface,

    borderRadius: 14,

    borderWidth: 1,
    borderColor: Colors.border,

    paddingHorizontal: 13,
  },

  field: {
    paddingVertical: 8,
  },

  noteField: {
    paddingVertical: 8,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },

  /* Save */

  saveButton: {
    height: 46,

    borderRadius: 12,

    backgroundColor:
      Colors.primary ?? "#4F46E5",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 6,

    marginTop: 10,
  },

  saveButtonPressed: {
    opacity: 0.85,
  },

  saveButtonDisabled: {
    opacity: 0.55,
  },

  saveButtonText: {
    color: "#FFFFFF",

    fontSize: 14,
    fontWeight: "700",
  },

  /* Delete */

  deleteButton: {
    height: 40,

    borderRadius: 11,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 6,

    marginTop: 5,
  },

  deleteButtonPressed: {
    opacity: 0.55,
  },

  deleteButtonDisabled: {
    opacity: 0.35,
  },

  deleteButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.danger ?? "#DC2626",
  },
});