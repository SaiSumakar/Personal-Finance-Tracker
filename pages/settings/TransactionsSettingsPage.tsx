import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  GestureResponderEvent,
} from "react-native";


import SettingsCard from "../../components/settings/SettingsCard";

import { Colors } from "../../constants/colors";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";

export default function TransactionSettingsPage() {
  const [defaultTransaction, setDefaultTransaction] =
    useState("Expense");

  const [currency, setCurrency] = useState("INR");

  const [defaultAccount, setDefaultAccount] =
    useState("Cash");

  const [dateFormat, setDateFormat] =
    useState("ddmmyyyy");

  const [confirmBeforeDelete, setConfirmBeforeDelete] =
    useState(true);

  const [openDropdown, setOpenDropdown] = useState(null);

  const [dropdownPosition, setDropdownPosition] =
    useState({
      top: 0,
      right: 0,
    });

  const transactionOptions = ["Expense", "Income"];

  const currencyOptions = ["INR", "USD", "GBP"];

  const accountOptions = ["Cash", "UPI"];

  const dateFormatOptions = ["ddmmyyyy", "mmddyyyy"];

  const openDropdownMenu = (type: any, event: GestureResponderEvent) => {
    event.currentTarget.measureInWindow(
      (_x, y, _width, height) => {
        setDropdownPosition({
          top: y + height + 4,
          right: 16,
        });

        setOpenDropdown(
          openDropdown === type ? null : type
        );
      }
    );
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Manage transaction preferences and default behavior.
        </Text>

        <View style={styles.settingsList}>
          {/* Default Transaction */}
          <SettingsCard
            // icon="swap-vertical-outline"
            title="Default Transaction"
            description="Set default transaction type"
          >
            <Pressable
              onPress={(event) =>
                openDropdownMenu("transaction", event)
              }
              style={styles.dropdown}
            >
              <Text style={styles.dropdownText}>
                {defaultTransaction}
              </Text>

              <Ionicons
                name={
                  openDropdown === "transaction"
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={18}
                color={Colors.textSecondary}
              />
            </Pressable>
          </SettingsCard>

          {/* Currency */}
          <SettingsCard
            // icon="cash-outline"
            title="Currency"
            description="Choose transaction currency"
          >
            <Pressable
              onPress={(event) =>
                openDropdownMenu("currency", event)
              }
              style={styles.dropdown}
            >
              <Text style={styles.dropdownText}>
                {currency}
              </Text>

              <Ionicons
                name={
                  openDropdown === "currency"
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={18}
                color={Colors.textSecondary}
              />
            </Pressable>
          </SettingsCard>

          {/* Default Account */}
          <SettingsCard
            // icon="wallet-outline"
            title="Default Account"
            description="Set default account"
          >
            <Pressable
              onPress={(event) =>
                openDropdownMenu("account", event)
              }
              style={styles.dropdown}
            >
              <Text style={styles.dropdownText}>
                {defaultAccount}
              </Text>

              <Ionicons
                name={
                  openDropdown === "account"
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={18}
                color={Colors.textSecondary}
              />
            </Pressable>
          </SettingsCard>

          {/* Date Format */}
          <SettingsCard
            // icon="calendar-outline"
            title="Date Format"
            description="Choose date format"
          >
            <Pressable
              onPress={(event) =>
                openDropdownMenu("dateFormat", event)
              }
              style={styles.dropdown}
            >
              <Text style={styles.dropdownText}>
                {dateFormat}
              </Text>

              <Ionicons
                name={
                  openDropdown === "dateFormat"
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={18}
                color={Colors.textSecondary}
              />
            </Pressable>
          </SettingsCard>

          {/* Confirm Before Deleting */}
          <SettingsCard
            // icon="trash-outline"
            title="Confirm Before Deleting a Transaction"
          >
            <Switch
              value={confirmBeforeDelete}
              onValueChange={setConfirmBeforeDelete}
              trackColor={{
                false: Colors.border,
                true: Colors.primary,
              }}
              thumbColor={Colors.surface}
            />
          </SettingsCard>
        </View>
      </ScrollView>

      {/* Dropdown Modal */}
      <Modal
        visible={openDropdown !== null}
        transparent
        animationType="none"
        onRequestClose={closeDropdown}
      >
        <View style={styles.modalContainer}>
          {/* Outside touch */}
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeDropdown}
          />

          {/* Dropdown */}
          <View
            style={[
              styles.dropdownOptions,
              {
                top: dropdownPosition.top,
                right: dropdownPosition.right,
              },
            ]}
          >
            {openDropdown === "transaction" &&
              transactionOptions.map((option) => {
                const isSelected =
                  option === defaultTransaction;

                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setDefaultTransaction(option);
                      closeDropdown();
                    }}
                    style={[
                      styles.dropdownOption,
                      isSelected &&
                        styles.dropdownOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        isSelected &&
                          styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>

                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={Colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}

            {openDropdown === "currency" &&
              currencyOptions.map((option) => {
                const isSelected = option === currency;

                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setCurrency(option);
                      closeDropdown();
                    }}
                    style={[
                      styles.dropdownOption,
                      isSelected &&
                        styles.dropdownOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        isSelected &&
                          styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>

                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={Colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}

            {openDropdown === "account" &&
              accountOptions.map((option) => {
                const isSelected =
                  option === defaultAccount;

                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setDefaultAccount(option);
                      closeDropdown();
                    }}
                    style={[
                      styles.dropdownOption,
                      isSelected &&
                        styles.dropdownOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        isSelected &&
                          styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>

                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={Colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}

            {openDropdown === "dateFormat" &&
              dateFormatOptions.map((option) => {
                const isSelected =
                  option === dateFormat;

                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setDateFormat(option);
                      closeDropdown();
                    }}
                    style={[
                      styles.dropdownOption,
                      isSelected &&
                        styles.dropdownOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        isSelected &&
                          styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>

                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={Colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },

  description: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },

  settingsList: {
    gap: Spacing.md,
  },

  dropdown: {
    minWidth: 110,
    height: 42,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },

  dropdownText: {
    fontSize: Typography.caption,
    fontWeight: "500",
    color: Colors.text,
  },

  modalContainer: {
    flex: 1,
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },

  dropdownOptions: {
    position: "absolute",
    minWidth: 140,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,

    elevation: 6,
    overflow: "hidden",
  },

  dropdownOption: {
    minHeight: 48,
    paddingHorizontal: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  dropdownOptionSelected: {
    backgroundColor: Colors.primaryLight,
  },

  dropdownOptionText: {
    fontSize: Typography.body,
    color: Colors.text,
  },

  dropdownOptionTextSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },
});