import { useEffect, useState } from "react";
import {
  LayoutRectangle,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import SettingsDropdown from "../components/SettingsDropdown";

import { Colors } from "@/theme/colors";
import { Spacing } from "@/theme/spacing";
import { Typography } from "@/theme/typography";

import { useSettingsStore } from "../stores/settingsStore";
import { useAccountStore } from "@/features/accounts/stores/accountStore";

import { SUPPORTED_CURRENCIES } from "@/constants/currencies";
import { SUPPORTED_DATE_FORMATS } from "@/constants/dateFormat";

import type { Currency } from "@/constants/currencies";
import type { DateFormat } from "@/constants/dateFormat";

type DropdownType =
  | "transaction"
  | "currency"
  | "account"
  | "dateFormat"
  | null;

type TransactionType = "expense" | "income";

export default function TransactionSettingsPage() {
  const {
    settings,
    loading,
    error,
    loadSettings,
    updateSettings,
  } = useSettingsStore();

  const { accounts, loadAccounts } = useAccountStore();

  const [openDropdown, setOpenDropdown] =
    useState<DropdownType>(null);

  const [dropdownPosition, setDropdownPosition] =
    useState<LayoutRectangle | undefined>();

  useEffect(() => {
    loadSettings();
    loadAccounts();
  }, [loadSettings, loadAccounts]);

  const transactionOptions = [
    {
      label: "Expense",
      value: "expense" as const,
    },
    {
      label: "Income",
      value: "income" as const,
    },
  ];

  const currencyOptions = SUPPORTED_CURRENCIES.map(
    (currency) => ({
      label: currency,
      value: currency,
    })
  );

  const accountOptions = accounts.map((account) => ({
    label: account.name,
    value: String(account.id),
  }));

  const dateFormatOptions = SUPPORTED_DATE_FORMATS.map(
    (dateFormat) => ({
      label: dateFormat,
      value: dateFormat,
    })
  );

  const closeDropdown = () => {
    setOpenDropdown(null);
    setDropdownPosition(undefined);
  };

  const openDropdownMenu = (
    type: Exclude<DropdownType, null>,
    position: LayoutRectangle
  ) => {
    if (openDropdown === type) {
      closeDropdown();
      return;
    }

    setDropdownPosition(position);
    setOpenDropdown(type);
  };

  const selectedAccount = accounts.find(
    (account) =>
      account.id === settings.defaultAccountId
  );

  /*
   * Show a loading state while the initial settings
   * are being fetched from the database.
   */
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Loading settings...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={closeDropdown}
        scrollEventThrottle={16}
      >
        {/* Error */}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.description}>
            Set preferences for adding and managing
            transactions.
          </Text>
        </View>

        {/* Defaults */}

        <SettingsSection title="Defaults">
          {/* Transaction type */}

          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>
                Transaction type
              </Text>

              <Text style={styles.rowDescription}>
                Used when creating a new transaction
              </Text>
            </View>

            <SettingsDropdown
              value={
                settings.defaultTransactionType ===
                "expense"
                  ? "Expense"
                  : "Income"
              }
              options={transactionOptions}
              open={openDropdown === "transaction"}
              position={
                openDropdown === "transaction"
                  ? dropdownPosition
                  : undefined
              }
              onOpen={(layout) =>
                openDropdownMenu(
                  "transaction",
                  layout
                )
              }
              onSelect={(value) => {
                console.log("🔵 PAGE SELECT:", value);

                updateSettings({
                  defaultTransactionType: value as TransactionType,
                });
              }}
              onClose={closeDropdown}
            />
          </View>

          <Divider />

          {/* Default account */}

          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>
                Default account
              </Text>

              <Text style={styles.rowDescription}>
                Used when creating a new transaction
              </Text>
            </View>

            <SettingsDropdown
              value={
                selectedAccount?.name ??
                "None"
              }
              options={accountOptions}
              open={openDropdown === "account"}
              position={
                openDropdown === "account"
                  ? dropdownPosition
                  : undefined
              }
              onOpen={(layout) =>
                openDropdownMenu(
                  "account",
                  layout
                )
              }
              onSelect={(value) =>
                updateSettings({
                  defaultAccountId: Number(value),
                })
              }
              onClose={closeDropdown}
            />
          </View>
        </SettingsSection>

        {/* Display */}

        <SettingsSection title="Display">
          {/* Currency */}

          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>
                Currency
              </Text>

              <Text style={styles.rowDescription}>
                Used for transaction amounts
              </Text>
            </View>

            <SettingsDropdown
              value={settings.currency}
              options={currencyOptions}
              open={openDropdown === "currency"}
              position={
                openDropdown === "currency"
                  ? dropdownPosition
                  : undefined
              }
              onOpen={(layout) =>
                openDropdownMenu(
                  "currency",
                  layout
                )
              }
              onSelect={(value) =>
                updateSettings({
                  currency: value as Currency,
                })
              }
              onClose={closeDropdown}
            />
          </View>

          <Divider />

          {/* Date format */}

          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>
                Date format
              </Text>

              <Text style={styles.rowDescription}>
                Example:{" "}
                {settings.dateFormat ===
                "dd/mm/yyyy"
                  ? "11/08/2026"
                  : "08/11/2026"}
              </Text>
            </View>

            <SettingsDropdown
              value={settings.dateFormat}
              options={dateFormatOptions}
              open={openDropdown === "dateFormat"}
              position={
                openDropdown === "dateFormat"
                  ? dropdownPosition
                  : undefined
              }
              onOpen={(layout) =>
                openDropdownMenu(
                  "dateFormat",
                  layout
                )
              }
              onSelect={(value) =>
                updateSettings({
                  dateFormat: value as DateFormat,
                })
              }
              onClose={closeDropdown}
            />
          </View>
        </SettingsSection>

        {/* Safety */}

        <SettingsSection title="Safety">
          <View style={styles.switchRow}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>
                Confirm before deleting
              </Text>

              <Text style={styles.rowDescription}>
                Ask before permanently deleting a
                transaction
              </Text>
            </View>

            <Switch
              value={
                settings.confirmTransactionDelete
              }
              onValueChange={async (value) => {
                await updateSettings({
                  confirmTransactionDelete: value,
                });
              }}
              trackColor={{
                false: Colors.border,
                true: Colors.primary,
              }}
              thumbColor={Colors.surface}
              ios_backgroundColor={Colors.border}
            />
          </View>
        </SettingsSection>
      </ScrollView>
    </View>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <View style={styles.sectionCard}>
        {children}
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },

  loadingText: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },

  errorContainer: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  errorText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },

  header: {
    marginBottom: Spacing.xl,
  },

  description: {
    fontSize: Typography.body,
    lineHeight: 21,
    color: Colors.text,
  },

  section: {
    marginBottom: Spacing.lg,
  },

  sectionTitle: {
    marginLeft: 4,
    marginBottom: 7,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  sectionCard: {
    overflow: "visible",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  row: {
    minHeight: 70,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },

  switchRow: {
    minHeight: 72,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  rowContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: Spacing.sm,
  },

  rowTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },

  rowDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
    backgroundColor: Colors.border,
  },

  dropdownOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "transparent",
    zIndex: 50,
  },
});