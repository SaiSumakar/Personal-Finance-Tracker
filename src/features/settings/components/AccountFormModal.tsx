import {
  ActivityIndicator,
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

type AccountFormModalProps = {
  visible: boolean;
  isEditing: boolean;
  isSaving: boolean;

  name: string;
  type: string;
  currency: string;
  openingBalance: string;
  selectedColor: string;
  showCurrencyDropdown: boolean;

  onNameChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onOpeningBalanceChange: (value: string) => void;
  onColorChange: (value: string) => void;

  onToggleCurrencyDropdown: () => void;
  onClose: () => void;
  onSave: () => void;
};

export default function AccountFormModal({
  visible,
  isEditing,
  isSaving,

  name,
  type,
  currency,
  openingBalance,
  selectedColor,
  showCurrencyDropdown,

  onNameChange,
  onTypeChange,
  onCurrencyChange,
  onOpeningBalanceChange,
  onColorChange,

  onToggleCurrencyDropdown,
  onClose,
  onSave,
}: AccountFormModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={onClose}
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
              onPress={onClose}
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
            {/* Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>

              <TextInput
                value={name}
                onChangeText={onNameChange}
                placeholder="e.g. HDFC Bank"
                placeholderTextColor={Colors.textSecondary}
                style={styles.input}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Type */}
            <View style={styles.field}>
              <Text style={styles.label}>Type</Text>

              <TextInput
                value={type}
                onChangeText={onTypeChange}
                placeholder="e.g. Bank, Cash, Wallet"
                placeholderTextColor={Colors.textSecondary}
                style={styles.input}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Currency + Opening balance */}
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
                  onPress={onToggleCurrencyDropdown}
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
                            onCurrencyChange(item);
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
                                Colors.primary ?? "#4F46E5"
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

                <View style={styles.balanceInputWrapper}>
                  <Text style={styles.currencyPrefix}>
                    {currency}
                  </Text>

                  <TextInput
                    value={openingBalance}
                    onChangeText={onOpeningBalanceChange}
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
                      style={({ pressed }) => [
                        styles.colorOptionOuter,
                        isSelected &&
                          styles.colorOptionSelected,
                        pressed &&
                          styles.colorOptionPressed,
                      ]}
                      onPress={() => onColorChange(color)}
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

            {/* Save */}
            <Pressable
              style={({ pressed }) => [
                styles.modalSaveButton,
                pressed &&
                  styles.modalSaveButtonPressed,
                isSaving &&
                  styles.modalSaveButtonDisabled,
              ]}
              onPress={onSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <Text
                    style={styles.modalSaveButtonText}
                  >
                    {isEditing ? "Saving..." : "Adding..."}
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