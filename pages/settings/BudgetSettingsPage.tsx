import { useMemo, useState } from "react";
import {
  Modal,
  TextInput,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";

import SettingsCard from "../../components/settings/SettingsCard";

import { Colors } from "../../constants/colors";
import { Spacing } from "../../constants/spacing";
import { Radius } from "../../constants/radius";
import { Typography } from "../../constants/typography";
import { addDays } from "date-fns";

type BudgetCycle = "Monthly" | "Quarterly" | "Yearly";

const budgetCycleOptions: BudgetCycle[] = [
  "Monthly",
  "Quarterly",
  "Yearly",
];

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const addMonths = (date: Date, months: number) => {
  const result = new Date(date);

  const originalDay = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + months);

  const lastDayOfMonth = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0
  ).getDate();

  result.setDate(Math.min(originalDay, lastDayOfMonth));

  return result;
};

const addYears = (date: Date, years: number) => {
  const result = new Date(date);

  const originalMonth = result.getMonth();
  const originalDay = result.getDate();

  result.setDate(1);
  result.setFullYear(result.getFullYear() + years);
  result.setMonth(originalMonth);

  const lastDayOfMonth = new Date(
    result.getFullYear(),
    originalMonth + 1,
    0
  ).getDate();

  result.setDate(Math.min(originalDay, lastDayOfMonth));

  return result;
};

const getNextBudgetDate = (
  budgetDate: Date,
  budgetCycle: BudgetCycle
) => {
  const today = startOfDay(new Date());
  let nextDate = startOfDay(budgetDate);

  if (nextDate > today) {
    return nextDate;
  }

  while (nextDate <= today) {
    switch (budgetCycle) {
      case "Monthly":
        nextDate = addDays(nextDate, 30);
        break;

      case "Quarterly":
        nextDate = addMonths(nextDate, 3);
        break;

      case "Yearly":
        nextDate = addYears(nextDate, 1);
        break;
    }
  }

  return nextDate;
};

const getDaysUntil = (date: Date) => {
  const today = startOfDay(new Date());
  const target = startOfDay(date);

  const difference =
    target.getTime() - today.getTime();

  return Math.max(
    0,
    Math.ceil(difference / (1000 * 60 * 60 * 24))
  );
};

export default function BudgetSettingsPage() {

  const [overallBudget, setOverallBudget] = useState('')

  const [budgetDate, setBudgetDate] = useState(
    new Date()
  );

  const [budgetCycle, setBudgetCycle] =
    useState<BudgetCycle>("Monthly");

  const [isBudgetCycleOpen, setIsBudgetCycleOpen] =
    useState(false);

  const [isBudgetDatePickerOpen, setIsBudgetDatePickerOpen] =
    useState(false);

  const [dropdownPosition, setDropdownPosition] =
    useState({
      top: 0,
      right: 16,
    });

  const nextBudgetDate = useMemo(
    () =>
      getNextBudgetDate(
        budgetDate,
        budgetCycle
      ),
    [budgetDate, budgetCycle]
  );

  const daysUntilNextBudget = useMemo(
    () => getDaysUntil(nextBudgetDate),
    [nextBudgetDate]
  );

  const openBudgetDatePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: budgetDate,
        mode: "date",
        onChange: (_event, selectedDate) => {
          if (selectedDate) {
            setBudgetDate(selectedDate);
          }
        },
        minimumDate: new Date(),
      });

      return;
    }

    setIsBudgetDatePickerOpen(true);
  };

  const openBudgetCycleDropdown = (
    event: GestureResponderEvent
  ) => {
    event.currentTarget.measureInWindow(
      (_x, y, _width, height) => {
        setDropdownPosition({
          top: y + height + 4,
          right: 16,
        });

        setIsBudgetCycleOpen(
          (previous) => !previous
        );
      }
    );
  };

  const closeBudgetCycleDropdown = () => {
    setIsBudgetCycleOpen(false);
  };

  const handleCycleChange = (
    cycle: BudgetCycle
  ) => {
    setBudgetCycle(cycle);
    closeBudgetCycleDropdown();
  };

  const getNextBudgetDescription = () => {
    if (daysUntilNextBudget === 0) {
      return "Budget resets today";
    }

    if (daysUntilNextBudget === 1) {
      return "Budget resets tomorrow";
    }

    return `${budgetCycle} • ${daysUntilNextBudget} days`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Manage when your budget starts and how often
          it resets.
        </Text>

        <View style={styles.settingsList}>

          {/* NEXT BUDGET DATE */}
          <View style={styles.nextBudgetTile}>
            <View style={styles.nextBudgetIcon}>
              <Ionicons
                name="refresh-outline"
                size={19}
                color={Colors.primary}
              />
            </View>

            <View style={styles.nextBudgetContent}>
              <Text style={styles.nextBudgetLabel}>
                Next Budget Date
              </Text>

              <Text style={styles.nextBudgetMeta}>
                {getNextBudgetDescription()}
              </Text>
            </View>

            <Text style={styles.nextBudgetDate}>
              {formatDate(nextBudgetDate)}
            </Text>
          </View>

          {/* BUDGET DATE */}
          <SettingsCard
            title="Budget Date"
            description="The date your budget period starts"
          >
            <Pressable
              onPress={openBudgetDatePicker}
              style={({ pressed }) => [
                styles.dateControl,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.dateControlText}>
                {formatDate(budgetDate)}
              </Text>

              <View style={styles.calendarIconContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={Colors.primary}
                />
              </View>
            </Pressable>
          </SettingsCard>

          {/* IOS BUDGET DATE PICKER */}
          {Platform.OS === "ios" &&
            isBudgetDatePickerOpen && (
              <View style={styles.iosPickerContainer}>
                <DateTimePicker
                  value={budgetDate}
                  mode="date"
                  display="spinner"
                  onChange={(_event, selectedDate) => {
                    if (selectedDate) {
                      setBudgetDate(selectedDate);
                    }
                  }}
                  minimumDate={new Date()}
                />

                <Pressable
                  onPress={() =>
                    setIsBudgetDatePickerOpen(false)
                  }
                  style={styles.doneButton}
                >
                  <Text style={styles.doneButtonText}>
                    Done
                  </Text>
                </Pressable>
              </View>
            )}

          {/* BUDGET CYCLE */}
          <SettingsCard
            title="Budget Cycle"
            description="Choose how often your budget resets"
          >
            <Pressable
              onPress={openBudgetCycleDropdown}
              style={({ pressed }) => [
                styles.dropdown,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.dropdownText}>
                {budgetCycle}
              </Text>

              <Ionicons
                name={
                  isBudgetCycleOpen
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={18}
                color={Colors.textSecondary}
              />
            </Pressable>
          </SettingsCard>

          {/* OVERALL BUDGET */}
          <SettingsCard
            title="Overall Budget"
            description="Set your total budget"
          >
            <TextInput
              value={overallBudget}
              onChangeText={setOverallBudget}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              style={styles.input}
            />
          </SettingsCard>
        </View>
      </ScrollView>

      {/* BUDGET CYCLE DROPDOWN */}
      <Modal
        visible={isBudgetCycleOpen}
        transparent
        animationType="none"
        onRequestClose={closeBudgetCycleDropdown}
      >
        <View style={styles.modalContainer}>

          {/* OUTSIDE TOUCH */}
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeBudgetCycleDropdown}
          />

          {/* DROPDOWN */}
          <View
            style={[
              styles.dropdownOptions,
              {
                top: dropdownPosition.top,
                right: dropdownPosition.right,
              },
            ]}
          >
            {budgetCycleOptions.map((option) => {
              const isSelected =
                option === budgetCycle;

              return (
                <Pressable
                  key={option}
                  onPress={() =>
                    handleCycleChange(option)
                  }
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

  pressed: {
    opacity: 0.7,
  },

  input: {
    minWidth: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    padding: 10,
    fontSize: 16,
    textAlign: 'right',
  },

  /* BUDGET DATE */

  dateControl: {
    minWidth: 126,
    height: 44,
    paddingLeft: Spacing.md,
    paddingRight: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },

  dateControlText: {
    fontSize: Typography.caption,
    fontWeight: "600",
    color: Colors.text,
  },

  calendarIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  /* DROPDOWN */

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
    fontWeight: "600",
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

  /* NEXT BUDGET TILE */

  nextBudgetTile: {
    minHeight: 80,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 1,
  },

  nextBudgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  nextBudgetContent: {
    flex: 1,
  },

  nextBudgetLabel: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },

  nextBudgetDate: {
    fontSize: Typography.body,
    fontWeight: "700",
    color: Colors.text,
  },

  nextBudgetMeta: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  /* IOS PICKER */

  iosPickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    overflow: "hidden",
    alignItems: "center",
  },

  doneButton: {
    width: "100%",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  doneButtonText: {
    fontSize: Typography.body,
    fontWeight: "600",
    color: Colors.primary,
  },
});