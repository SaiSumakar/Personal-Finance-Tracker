import { useState } from "react";
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

import { Colors } from "../../../theme/colors";
import { Spacing } from "../../../theme/spacing";
import { Typography } from "../../../theme/typography";

type DropdownType =
  | "transaction"
  | "currency"
  | "account"
  | "dateFormat"
  | null;

type TransactionType = "Expense" | "Income";
type Currency = "INR" | "USD" | "GBP";
type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY";

export default function TransactionSettingsPage() {
  const [defaultTransaction, setDefaultTransaction] =
    useState<TransactionType>("Expense");

  const [currency, setCurrency] =
    useState<Currency>("INR");

  const [defaultAccount, setDefaultAccount] =
    useState("Cash");

  const [dateFormat, setDateFormat] =
    useState<DateFormat>("DD/MM/YYYY");

  const [confirmBeforeDelete, setConfirmBeforeDelete] =
    useState(true);

  const [openDropdown, setOpenDropdown] =
    useState<DropdownType>(null);

  const [dropdownPosition, setDropdownPosition] =
    useState<LayoutRectangle | undefined>();

  const transactionOptions = [
    {
      label: "Expense",
      value: "Expense",
    },
    {
      label: "Income",
      value: "Income",
    },
  ];

  const currencyOptions = [
    {
      label: "INR",
      value: "INR",
    },
    {
      label: "USD",
      value: "USD",
    },
    {
      label: "GBP",
      value: "GBP",
    },
  ];

  const accountOptions = [
    {
      label: "Cash",
      value: "Cash",
    },
    {
      label: "UPI",
      value: "UPI",
    },
  ];

  const dateFormatOptions = [
    {
      label: "DD/MM/YYYY",
      value: "DD/MM/YYYY",
    },
    {
      label: "MM/DD/YYYY",
      value: "MM/DD/YYYY",
    },
  ];

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

  return (
    <View
      style={styles.container}
      onTouchStart={(event) => {
        /*
         * Only close when the user taps outside
         * the currently open dropdown.
         *
         * The dropdown itself stops propagation.
         */
        if (openDropdown !== null) {
          closeDropdown();
        }
      }}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={closeDropdown}
        scrollEventThrottle={16}
      >
        {/* Header */}

        <View style={styles.header}>

          <Text style={styles.description}>
            Set preferences for adding and managing
            transactions.
          </Text>
        </View>

        {/* Defaults */}

        <SettingsSection title="Defaults">
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
              value={defaultTransaction}
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
              onSelect={(value) =>
                setDefaultTransaction(
                  value as TransactionType
                )
              }
              onClose={closeDropdown}
            />
          </View>

          <Divider />

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
              value={defaultAccount}
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
              onSelect={setDefaultAccount}
              onClose={closeDropdown}
            />
          </View>
        </SettingsSection>

        {/* Display */}

        <SettingsSection title="Display">
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
              value={currency}
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
                setCurrency(value as Currency)
              }
              onClose={closeDropdown}
            />
          </View>

          <Divider />

          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>
                Date format
              </Text>

              <Text style={styles.rowDescription}>
                Example:{" "}
                {dateFormat === "DD/MM/YYYY"
                  ? "11/08/2026"
                  : "08/11/2026"}
              </Text>
            </View>

            <SettingsDropdown
              value={dateFormat}
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
                setDateFormat(value as DateFormat)
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
              value={confirmBeforeDelete}
              onValueChange={setConfirmBeforeDelete}
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

      {/* Dropdown layer */}

      {openDropdown !== null && (
        <Pressable
          style={styles.dropdownOverlay}
          onPress={closeDropdown}
        />
      )}
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

  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },

  /* Header */

  header: {
    marginBottom: Spacing.xl,
  },

  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.4,
    marginBottom: Spacing.xs,
  },

  description: {
    fontSize: Typography.body,
    lineHeight: 21,
    color: Colors.text,
  },

  /* Sections */

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

  /* Rows */

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

  /* Dropdown */

  dropdownOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "transparent",
    zIndex: 50,
  },
});