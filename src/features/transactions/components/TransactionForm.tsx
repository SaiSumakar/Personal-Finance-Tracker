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

      from_account_id:
        defaultAccount?.id ?? null,

      to_account_id: null,

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

  const selectedCategory =
    watch("category_id");

  const selectedFromAccount =
    watch("from_account_id");

  const isIncome =
    transactionType === "income";

  const isTransfer =
    transactionType === "transfer";

  const isExpense =
    transactionType === "expense";

  const categories =
    isIncome
      ? incomeCategories
      : expenseCategories;

  const accountOptions = accounts.map(
    (account) => ({
      label: account.name,
      value: account.id,
    })
  );

  const toAccountOptions =
    accounts
      .filter(
        (account) =>
          account.id !== selectedFromAccount
      )
      .map((account) => ({
        label: account.name,
        value: account.id,
      }));

  /*
   * Reset category when switching
   * between income and expense.
   */
  useEffect(() => {
    if (isTransfer) {
      return;
    }

    const categoryExists =
      categories.some(
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
    categories,
    selectedCategory,
    setValue,
    isTransfer,
  ]);

  /*
   * Load accounts and categories.
   */
  useEffect(() => {
    loadAccounts();
    loadCategories();
  }, [
    loadAccounts,
    loadCategories,
  ]);

  /*
   * Keep account fields consistent
   * with the selected transaction type.
   */
  useEffect(() => {
    if (!defaultAccount) {
      return;
    }

    if (isExpense) {
      setValue(
        "from_account_id",
        defaultAccount.id
      );

      setValue(
        "to_account_id",
        null
      );

      return;
    }

    if (isIncome) {
      setValue(
        "from_account_id",
        null
      );

      setValue(
        "to_account_id",
        defaultAccount.id
      );

      return;
    }

    if (isTransfer) {
      const fromAccountId =
        methods.getValues(
          "from_account_id"
        );

      if (
        fromAccountId == null ||
        fromAccountId <= 0
      ) {
        setValue(
          "from_account_id",
          defaultAccount.id
        );
      }
    }
  }, [
    defaultAccount,
    isExpense,
    isIncome,
    isTransfer,
    methods,
    setValue,
  ]);

  /*
   * Clear destination account if
   * it becomes the same as source.
   */
  useEffect(() => {
    const fromAccountId =
      methods.getValues(
        "from_account_id"
      );

    const toAccountId =
      methods.getValues(
        "to_account_id"
      );

    if (
      fromAccountId != null &&
      fromAccountId > 0 &&
      fromAccountId === toAccountId
    ) {
      setValue(
        "to_account_id",
        null
      );
    }
  }, [
    selectedFromAccount,
    methods,
    setValue,
  ]);

  const onSubmit = async (
    data: TransactionFormValues
  ) => {
    const result =
      await addTransaction({
        type: data.type,

        amount: data.amount,

        category_id:
          data.category_id || undefined,

        from_account_id:
          data.from_account_id ?? null,

        to_account_id:
          data.to_account_id ?? null,

        transaction_date:
          data.transaction_date.toISOString(),

        note:
          data.note || undefined,

        payment_method:
          data.payment_method ||
          undefined,

        location:
          data.location || undefined,
      });

    if (!result) {
      Alert.alert(
        isTransfer
          ? "Unable to transfer"
          : "Unable to save",
        isTransfer
          ? "The transfer could not be saved. Please try again."
          : "The transaction could not be saved. Please try again."
      );

      return;
    }

    methods.reset({
      type: data.type,

      amount: 0,

      category_id: 0,

      from_account_id:
        data.type === "income"
          ? null
          : defaultAccount?.id ?? null,

      to_account_id:
        data.type === "income"
          ? defaultAccount?.id ?? null
          : null,

      transaction_date:
        new Date(),

      note: "",

      payment_method: "",
      location: "",
    });
  };

  const buttonTitle = isTransfer
    ? "Transfer Money"
    : isIncome
      ? "Add Income"
      : "Add Expense";

  const amountLabel = isTransfer
    ? "Transfer amount"
    : isIncome
      ? "Amount received"
      : "Amount spent";

  const amountHint = isTransfer
    ? "Enter the amount to transfer"
    : "Enter the transaction amount";

  const statusText = isTransfer
    ? "Transfer between accounts"
    : isIncome
      ? "Income transaction"
      : "Expense transaction";

  const sectionTitle = isTransfer
    ? "Transfer details"
    : "Transaction details";

  const sectionSubtitle = isTransfer
    ? "Move money between accounts"
    : "Add the basic information";

  const summaryTitle = isTransfer
    ? "Ready to transfer?"
    : "Ready to save?";

  const summaryText = isTransfer
    ? "Money will move between your selected accounts."
    : "Your transaction will be added to your records.";

  const accountFieldName =
    isIncome
      ? "to_account_id"
      : "from_account_id";

  const accountLabel =
    isIncome
      ? "To account"
      : "From account";

  const accountPlaceholder =
    isIncome
      ? "Select destination account"
      : "Select source account";

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
          contentContainerStyle={
            styles.content
          }
        >
          {/* Transaction Type */}

          <View style={styles.typeSection}>
            <TransactionTypeToggle />
          </View>

          {/* Amount */}

          <View
            style={[
              styles.amountCard,

              isIncome &&
                styles.amountCardIncome,

              isTransfer &&
                styles.amountCardTransfer,
            ]}
          >
            <View
              style={styles.amountHeader}
            >
              <View>
                <Text
                  style={styles.amountLabel}
                >
                  {amountLabel}
                </Text>

                <Text
                  style={styles.amountHint}
                >
                  {amountHint}
                </Text>
              </View>

              <View
                style={[
                  styles.amountIcon,

                  isIncome
                    ? styles.incomeIcon
                    : isTransfer
                      ? styles.transferIcon
                      : styles.expenseIcon,
                ]}
              >
                <Text
                  style={[
                    styles.amountIconText,

                    isIncome
                      ? styles.incomeIconText
                      : isTransfer
                        ? styles.transferIconText
                        : styles.expenseIconText,
                  ]}
                >
                  ₹
                </Text>
              </View>
            </View>

            <AmountInput />

            {amount > 0 && (
              <View
                style={styles.amountStatus}
              >
                <View
                  style={[
                    styles.statusDot,

                    {
                      backgroundColor:
                        isIncome
                          ? Colors.success
                          : Colors.primary,
                    },
                  ]}
                />

                <Text
                  style={
                    styles.amountStatusText
                  }
                >
                  {statusText}
                </Text>
              </View>
            )}
          </View>

          {/* Details Header */}

          <View
            style={styles.sectionHeader}
          >
            <View>
              <Text
                style={styles.sectionTitle}
              >
                {sectionTitle}
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                {sectionSubtitle}
              </Text>
            </View>
          </View>

          {/* Transfer Details */}

          {isTransfer ? (
            <View
              style={styles.detailsCard}
            >
              <View style={styles.field}>
                <AppSelect
                  label="From account"
                  name="from_account_id"
                  control={
                    methods.control
                  }
                  placeholder="Select source account"
                  options={
                    accountOptions
                  }
                />
              </View>

              <View
                style={styles.divider}
              />

              <View style={styles.field}>
                <AppSelect
                  label="To account"
                  name="to_account_id"
                  control={
                    methods.control
                  }
                  placeholder="Select destination account"
                  options={
                    toAccountOptions
                  }
                />
              </View>

              <View
                style={styles.divider}
              />

              <View
                style={styles.noteField}
              >
                <NoteInput />
              </View>

              <View
                style={styles.divider}
              />

              <View style={styles.field}>
                <AppDatePicker
                  label="Date"
                  name="transaction_date"
                  control={
                    methods.control
                  }
                />
              </View>
            </View>
          ) : (
            <>
              {/* Normal Transaction Details */}

              <View
                style={styles.detailsCard}
              >
                <View
                  style={styles.field}
                >
                  <AppSelect
                    label="Category"
                    name="category_id"
                    control={
                      methods.control
                    }
                    placeholder="Select category"
                    options={categories.map(
                      (category) => ({
                        label:
                          category.name,

                        value:
                          category.id,
                      })
                    )}
                  />
                </View>

                <View
                  style={styles.divider}
                />

                <View
                  style={styles.field}
                >
                  <AppSelect
                    label={accountLabel}
                    name={accountFieldName}
                    control={
                      methods.control
                    }
                    placeholder={
                      accountPlaceholder
                    }
                    options={
                      accountOptions
                    }
                  />
                </View>

                <View
                  style={styles.divider}
                />

                <View
                  style={styles.field}
                >
                  <AppDatePicker
                    label="Date"
                    name="transaction_date"
                    control={
                      methods.control
                    }
                  />
                </View>
              </View>

              {/* Optional Details */}

              <View
                style={styles.optionalHeader}
              >
                <View>
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Additional details
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    Optional information
                  </Text>
                </View>

                <View
                  style={
                    styles.optionalBadge
                  }
                >
                  <Text
                    style={
                      styles.optionalText
                    }
                  >
                    Optional
                  </Text>
                </View>
              </View>

              <View
                style={styles.detailsCard}
              >
                <View
                  style={styles.noteField}
                >
                  <NoteInput />
                </View>
              </View>
            </>
          )}

          {/* Summary */}

          <View
            style={styles.summaryCard}
          >
            <View
              style={styles.summaryIcon}
            >
              <Text
                style={
                  styles.summaryIconText
                }
              >
                ✓
              </Text>
            </View>

            <View
              style={styles.summaryContent}
            >
              <Text
                style={
                  styles.summaryTitle
                }
              >
                {summaryTitle}
              </Text>

              <Text
                style={
                  styles.summaryText
                }
              >
                {summaryText}
              </Text>
            </View>
          </View>

          {/* Action */}

          <View
            style={
              styles.actionContainer
            }
          >
            <AppButton
              title={buttonTitle}
              onPress={
                handleSubmit(onSubmit)
              }
              loading={
                transactionLoading
              }
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
    backgroundColor:
      Colors.background,
  },

  content: {
    paddingHorizontal:
      Spacing.lg,

    paddingTop:
      Spacing.lg,

    paddingBottom: 40,
  },

  /* Transaction Type */

  typeSection: {
    marginBottom:
      Spacing.md,
  },

  /* Amount */

  amountCard: {
    backgroundColor:
      Colors.surface,

    borderRadius:
      Radius.xl,

    borderWidth: 1,
    borderColor:
      Colors.border,

    padding:
      Spacing.lg,

    marginBottom:
      Spacing.xxl,

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
    borderColor:
      Colors.successLight,
  },

  amountCardTransfer: {
    borderColor:
      Colors.primary,
  },

  amountHeader: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",

    marginBottom:
      Spacing.md,
  },

  amountLabel: {
    fontSize:
      Typography.heading,

    fontWeight: "700",

    color:
      Colors.text,
  },

  amountHint: {
    marginTop: 3,

    fontSize:
      Typography.small,

    color:
      Colors.textSecondary,
  },

  amountIcon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    alignItems: "center",

    justifyContent:
      "center",
  },

  expenseIcon: {
    backgroundColor:
      "#EFF6FF",
  },

  incomeIcon: {
    backgroundColor:
      "#F0FDF4",
  },

  transferIcon: {
    backgroundColor:
      "#F5F3FF",
  },

  amountIconText: {
    fontSize: 19,
    fontWeight: "800",
  },

  expenseIconText: {
    color:
      Colors.primary,
  },

  incomeIconText: {
    color:
      Colors.success,
  },

  transferIconText: {
    color:
      Colors.primary,
  },

  amountStatus: {
    flexDirection: "row",

    alignItems: "center",

    marginTop:
      Spacing.md,
  },

  statusDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    marginRight: 7,
  },

  amountStatusText: {
    fontSize:
      Typography.small,

    color:
      Colors.textSecondary,

    fontWeight: "600",
  },

  /* Sections */

  sectionHeader: {
    marginBottom:
      Spacing.sm,
  },

  optionalHeader: {
    marginTop:
      Spacing.xxl,

    marginBottom:
      Spacing.sm,

    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",
  },

  sectionTitle: {
    fontSize:
      Typography.heading,

    fontWeight: "700",

    color:
      Colors.text,
  },

  sectionSubtitle: {
    marginTop: 3,

    fontSize:
      Typography.small,

    color:
      Colors.textSecondary,
  },

  optionalBadge: {
    backgroundColor:
      Colors.background,

    borderWidth: 1,

    borderColor:
      Colors.border,

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 999,
  },

  optionalText: {
    fontSize: 10,

    fontWeight: "700",

    color:
      Colors.textSecondary,
  },

  /* Details */

  detailsCard: {
    backgroundColor:
      Colors.surface,

    borderRadius:
      Radius.xl,

    borderWidth: 1,

    borderColor:
      Colors.border,

    paddingHorizontal:
      Spacing.lg,

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
    paddingVertical:
      Spacing.md,
  },

  noteField: {
    paddingVertical:
      Spacing.md,
  },

  divider: {
    height: 1,

    backgroundColor:
      Colors.border,
  },

  /* Summary */

  summaryCard: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor:
      Colors.surface,

    borderRadius:
      Radius.lg,

    borderWidth: 1,

    borderColor:
      Colors.border,

    padding:
      Spacing.md,

    marginTop:
      Spacing.xxl,
  },

  summaryIcon: {
    width: 34,
    height: 34,

    borderRadius: 10,

    backgroundColor:
      "#F0FDF4",

    alignItems: "center",

    justifyContent:
      "center",

    marginRight: 10,
  },

  summaryIconText: {
    fontSize: 15,

    fontWeight: "800",

    color:
      Colors.success,
  },

  summaryContent: {
    flex: 1,
  },

  summaryTitle: {
    fontSize: 12,

    fontWeight: "700",

    color:
      Colors.text,
  },

  summaryText: {
    marginTop: 2,

    fontSize: 11,

    lineHeight: 16,

    color:
      Colors.textSecondary,
  },

  /* Action */

  actionContainer: {
    marginTop:
      Spacing.md,
  },
});