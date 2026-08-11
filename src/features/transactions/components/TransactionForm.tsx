import { useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
import AppButton from "../components/form/AppButton";

import { useTransactionStore } from "../stores/transactionStore";
import { useAccountStore } from "../../accounts/stores/accountStore";
import { useCategoryStore } from "../../categories/stores/categoryStore";

import { Colors } from "../../../theme/colors";
import { Spacing } from "../../../theme/spacing";
import { Radius } from "../../../theme/radius";
import { Typography } from "../../../theme/typography";

export default function TransactionForm() {
  const addTransaction = useTransactionStore(
    (state) => state.addTransaction
  );

  const transactionLoading = useTransactionStore(
    (state) => state.loading
  );

  const accounts = useAccountStore(
    (state) => state.accounts
  );

  const defaultAccount = useAccountStore(
    (state) => state.defaultAccount
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
      account_id: defaultAccount?.id ?? 0,
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
  } = methods;

  const transactionType = watch("type");
  const amount = watch("amount");

  const selectedCategory = watch("category_id");

  const categories =
    transactionType === "income"
      ? incomeCategories
      : expenseCategories;

  useEffect(() => {
    const categoryExists = categories.some(
      (category) => category.id === selectedCategory
    );

    if (
      selectedCategory !== 0 &&
      !categoryExists
    ) {
      setValue("category_id", 0);
    }
  }, [
    categories,
    selectedCategory,
    setValue,
  ]);

  useEffect(() => {
    loadAccounts();
    loadCategories();
  }, [loadAccounts, loadCategories]);

  useEffect(() => {
    if (
      defaultAccount &&
      methods.getValues("account_id") === 0
    ) {
      setValue(
        "account_id",
        defaultAccount.id
      );
    }
  }, [
    defaultAccount,
    methods,
    setValue,
  ]);

  const onSubmit = async (
    data: TransactionFormValues
  ) => {
    const result = await addTransaction({
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
    });

    if (!result) {
      Alert.alert(
        "Unable to save",
        "The transaction could not be saved. Please try again."
      );

      return;
    }

    methods.reset({
      type: data.type,
      amount: 0,
      category_id: 0,
      account_id:
        defaultAccount?.id ??
        data.account_id,
      transaction_date: new Date(),
      note: "",
      payment_method: "",
      location: "",
    });
  };

  const isIncome = transactionType === "income";

  const buttonTitle = isIncome
    ? "Add Income"
    : "Add Expense";

  const amountLabel = isIncome
    ? "Amount received"
    : "Amount spent";

  return (
    <FormProvider {...methods}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {/* Type */}
          <View style={styles.typeSection}>
            <TransactionTypeToggle />
          </View>

          {/* Amount Hero */}
          <View
            style={[
              styles.amountCard,
              isIncome && styles.amountCardIncome,
            ]}
          >
            <View style={styles.amountHeader}>
              <View>
                <Text style={styles.amountLabel}>
                  {amountLabel}
                </Text>

                <Text style={styles.amountHint}>
                  Enter the transaction amount
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

            {amount > 0 && (
              <View style={styles.amountStatus}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isIncome
                        ? Colors.success
                        : Colors.primary,
                    },
                  ]}
                />

                <Text style={styles.amountStatusText}>
                  {isIncome
                    ? "Income transaction"
                    : "Expense transaction"}
                </Text>
              </View>
            )}
          </View>

          {/* Essential Details */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Transaction details
              </Text>

              <Text style={styles.sectionSubtitle}>
                Add the basic information
              </Text>
            </View>
          </View>

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
          </View>

          {/* Optional Details */}
          <View style={styles.optionalHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Additional details
              </Text>

              <Text style={styles.sectionSubtitle}>
                Optional information
              </Text>
            </View>

            <View style={styles.optionalBadge}>
              <Text style={styles.optionalText}>
                Optional
              </Text>
            </View>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.noteField}>
              <NoteInput />
            </View>
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Text style={styles.summaryIconText}>
                ✓
              </Text>
            </View>

            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>
                Ready to save?
              </Text>

              <Text style={styles.summaryText}>
                Your transaction will be added to your records.
              </Text>
            </View>
          </View>

          {/* Action */}
          <View style={styles.actionContainer}>
            <AppButton
              title={buttonTitle}
              onPress={handleSubmit(onSubmit)}
              loading={transactionLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
  },

  /* Transaction Type */

  typeSection: {
    marginBottom: Spacing.md,
  },

  /* Amount */

  amountCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,

    borderWidth: 1,
    borderColor: Colors.border,

    padding: Spacing.lg,

    marginBottom: Spacing.xxl,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },

  amountCardIncome: {
    borderColor: Colors.successLight,
  },

  amountHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: Spacing.md,
  },

  amountLabel: {
    fontSize: Typography.heading,
    fontWeight: "700",
    color: Colors.text,
  },

  amountHint: {
    marginTop: 3,
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },

  amountIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,

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
    fontSize: 19,
    fontWeight: "800",
  },

  expenseIconText: {
    color: Colors.primary,
  },

  incomeIconText: {
    color: Colors.success,
  },

  amountStatus: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: Spacing.md,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,

    marginRight: 7,
  },

  amountStatusText: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    fontWeight: "600",
  },

  /* Sections */

  sectionHeader: {
    marginBottom: Spacing.sm,
  },

  optionalHeader: {
    marginTop: Spacing.xxl,
    marginBottom: Spacing.sm,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: Typography.heading,
    fontWeight: "700",
    color: Colors.text,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },

  optionalBadge: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 999,
  },

  optionalText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textSecondary,
  },

  /* Details */

  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,

    borderWidth: 1,
    borderColor: Colors.border,

    paddingHorizontal: Spacing.lg,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.025,
    shadowRadius: 10,
    elevation: 1,
  },

  field: {
    paddingVertical: Spacing.md,
  },

  noteField: {
    paddingVertical: Spacing.md,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },

  /* Summary */

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: Colors.surface,

    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,

    padding: Spacing.md,

    marginTop: Spacing.xxl,
  },

  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,

    backgroundColor: "#F0FDF4",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  summaryIconText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.success,
  },

  summaryContent: {
    flex: 1,
  },

  summaryTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
  },

  summaryText: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
  },

  /* Action */

  actionContainer: {
    marginTop: Spacing.md,
  },
});