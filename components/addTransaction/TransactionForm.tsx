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
} from "../../schemas/transactionSchema";

import TransactionTypeToggle from "./TransactionTypeToggle";
import AmountInput from "./AmountInput";
import NoteInput from "./NoteInput";

import AppSelect from "../form/AppSelect";
import AppDatePicker from "../form/AppDatePicker";
import AppButton from "../form/AppButton";

import { useTransactionStore } from "../../stores/transactionStore";
import { useAccountStore } from "../../stores/accountStore";
import { useCategoryStore } from "../../stores/categoryStore";

import { Colors } from "../../constants/colors";
import { Spacing } from "../../constants/spacing";
import { Radius } from "../../constants/radius";
import { Typography } from "../../constants/typography";

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
  const selectedCategory = watch("category_id");

  const categories =
    transactionType === "income"
      ? incomeCategories
      : expenseCategories;

  useEffect(() => {
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

    // Reset immediately so another transaction
    // can be entered without an interruption.
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

  const buttonTitle =
    transactionType === "income"
      ? "Add Income"
      : "Add Expense";

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

          {/* Transaction type */}
          <View style={styles.typeSection}>
            <TransactionTypeToggle />
          </View>

          {/* Amount hero */}
          <View
            style={[
              styles.amountCard,
              transactionType === "income" &&
                styles.amountCardIncome,
            ]}
          >
            <Text style={styles.amountLabel}>
              {transactionType === "income"
                ? "Money received"
                : "Money spent"}
            </Text>

            <AmountInput />
          </View>

          {/* Details */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Details
            </Text>
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

            <View style={styles.divider} />

            <View style={styles.noteField}>
              <NoteInput />
            </View>
          </View>

          {/* Primary action */}
          <View style={styles.actionContainer}>
            <AppButton
              title={buttonTitle}
              onPress={handleSubmit(onSubmit)}
              loading={transactionLoading}
            />

            <Text style={styles.actionHint}>
              Your transaction will be added instantly
            </Text>
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
    paddingTop: Spacing.xl,
    paddingBottom: 48,
  },

  header: {
    marginBottom: Spacing.xl,
  },

  eyebrow: {
    fontSize: Typography.caption,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },

  title: {
    fontSize: Typography.title,
    lineHeight: 30,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.6,
  },

  subtitle: {
    marginTop: 4,
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },

  typeSection: {
    marginBottom: Spacing.md,
  },

  amountCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    marginBottom: Spacing.xxl,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },

  amountCardIncome: {
    borderColor: Colors.successLight,
  },

  amountLabel: {
    fontSize: Typography.caption,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },

  sectionHeader: {
    marginBottom: Spacing.sm,
  },

  sectionTitle: {
    fontSize: Typography.heading,
    fontWeight: "700",
    color: Colors.text,
  },

  sectionHint: {
    marginTop: 3,
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },

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
    shadowOpacity: 0.03,
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

  actionContainer: {
    marginTop: Spacing.xxl,
  },

  actionHint: {
    textAlign: "center",
    marginTop: Spacing.sm,
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },
});