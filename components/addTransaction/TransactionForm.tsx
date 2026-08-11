import { useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
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

export default function TransactionForm() {
  const addTransaction =
    useTransactionStore(
      (state) => state.addTransaction
    );

  const transactionLoading =
    useTransactionStore(
      (state) => state.loading
    );

  const accounts =
    useAccountStore(
      (state) => state.accounts
    );

  const defaultAccount =
    useAccountStore(
      (state) => state.defaultAccount
    );

  const loadAccounts =
    useAccountStore(
      (state) => state.loadAccounts
    );

  const expenseCategories =
    useCategoryStore(
      (state) => state.expenseCategories
    );

  const incomeCategories =
    useCategoryStore(
      (state) => state.incomeCategories
    );

  const loadCategories =
    useCategoryStore(
      (state) => state.loadCategories
    );

  const methods =
    useForm<TransactionFormValues>({
      resolver: zodResolver(
        transactionSchema
      ),

      defaultValues: {
        type: "expense",
        amount: 0,
        category_id: 0,
        account_id:
          defaultAccount?.id ?? 0,
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

  const transactionType =
    watch("type");

  const selectedCategory =
    watch("category_id");

  /*
   * Categories depend on transaction type.
   */
  const categories =
    transactionType === "income"
      ? incomeCategories
      : expenseCategories;

  /*
   * If the current category doesn't
   * belong to the newly selected type,
   * reset the category.
   */
  const categoryExists = categories.some(
    (category) =>
      category.id === selectedCategory
  );

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
      setValue("account_id", defaultAccount.id);
    }
  }, [defaultAccount, methods, setValue]);

  const onSubmit = async (
    data: TransactionFormValues
  ) => {
    const result =
      await addTransaction({
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
        "The transaction could not be saved."
      );

      return;
    }

    Alert.alert(
      "Transaction saved",
      "Your transaction has been saved."
    );

    methods.reset({
      type: "expense",
      amount: 0,
      category_id: 0,
      account_id:
        defaultAccount?.id ?? 0,
      transaction_date: new Date(),
      note: "",
      payment_method: "",
      location: "",
    });
  };

  return (
    <FormProvider {...methods}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        <TransactionTypeToggle />

        <AmountInput />

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

        <AppDatePicker
          label="Date"
          name="transaction_date"
          control={methods.control}
        />

        <NoteInput />

        <AppButton
          title="Save Transaction"
          onPress={handleSubmit(onSubmit)}
          loading={transactionLoading}
        />
      </ScrollView>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
});