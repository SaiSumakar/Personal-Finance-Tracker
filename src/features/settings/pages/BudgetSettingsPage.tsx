import { useEffect, useMemo, useState } from "react";
import {
  TextInput,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  LayoutRectangle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";

import SettingsDropdown from "../components/SettingsDropdown";

import { Colors } from "@/theme/colors";
import { Spacing } from "@/theme/spacing";
import { Radius } from "@/theme/radius";
import { Typography } from "@/theme/typography";
import { addDays } from "date-fns";

import { useSettingsStore } from "../stores/settingsStore";

type BudgetCycle = "monthly" | "quarterly" | "yearly";

const budgetCycleOptions: BudgetCycle[] = [
  "monthly",
  "quarterly",
  "yearly",
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
      case "monthly":
        nextDate = addDays(nextDate, 30);
        break;

      case "quarterly":
        nextDate = addMonths(nextDate, 3);
        break;

      case "yearly":
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

const formatBudgetCycle = (cycle: BudgetCycle) => {
  return cycle.charAt(0).toUpperCase() + cycle.slice(1);
};

export default function BudgetSettingsPage() {

  const {
    settings,
    loading,
    error,
    loadSettings,
    updateSettings,
  } = useSettingsStore();

  const [budgetInput, setBudgetInput] = useState(
    settings.totalBudget?.toString() ?? ""
  );

  useEffect(() => {
    setBudgetInput(settings.totalBudget?.toString() ?? "");
  }, [settings.totalBudget]);

  const [budgetDate, setBudgetDate] = useState(
    new Date()
  );

  const budgetCycle =
    settings.defaultBudgetCycle ?? "monthly";

  const budgetCycleDisplay =
    budgetCycle === "monthly"
      ? "Monthly"
      : budgetCycle === "quarterly"
        ? "Quarterly"
        : "Yearly";

  const [isBudgetCycleOpen, setIsBudgetCycleOpen] =
    useState(false);

  const [isBudgetDatePickerOpen, setIsBudgetDatePickerOpen] =
    useState(false);

  const [dropdownPosition, setDropdownPosition] =
    useState<LayoutRectangle | undefined>(undefined);

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

  const closeBudgetCycleDropdown = () => {
    setIsBudgetCycleOpen(false);
    setDropdownPosition(undefined);
  };

  const handleCycleChange = async (
    cycle: BudgetCycle
  ) => {
    await updateSettings({
      defaultBudgetCycle: cycle,
    });
    closeBudgetCycleDropdown();
  };

  const getNextBudgetDescription = () => {
    if (daysUntilNextBudget === 0) {
      return "Budget resets today";
    }

    if (daysUntilNextBudget === 1) {
      return "Budget resets tomorrow";
    }

    return `${formatBudgetCycle(budgetCycle)} • ${daysUntilNextBudget} days`;
  };

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={closeBudgetCycleDropdown}
        scrollEventThrottle={16}
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
          {/* Settings rows */}
          <SettingsSection title="Budget">
            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Budget date</Text>
                <Text style={styles.rowDescription}>
                  The date your budget period starts
                </Text>
              </View>

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
            </View>

            <Divider />

            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Budget cycle</Text>
                <Text style={styles.rowDescription}>
                  Choose how often your budget resets
                </Text>
              </View>

              <SettingsDropdown
                value={budgetCycleDisplay}
                options={budgetCycleOptions.map((c) => ({
                  label: formatBudgetCycle(c),
                  value: c,
                }))}
                open={isBudgetCycleOpen}
                position={dropdownPosition}
                onOpen={(layout) => {
                  setDropdownPosition(layout);
                  setIsBudgetCycleOpen(true);
                }}
                onSelect={(value) =>
                  handleCycleChange(value as BudgetCycle)
                }
                onClose={closeBudgetCycleDropdown}
              />
            </View>

            <Divider />

            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Overall budget</Text>
                <Text style={styles.rowDescription}>
                  Set your total budget
                </Text>
              </View>

              <TextInput
                value={budgetInput}
                onChangeText={(value) => {
                  setBudgetInput(value);

                  updateSettings({
                    totalBudget: value === "" ? 0 : Number(value),
                  });
                }}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                style={styles.rowInput}
              />
            </View>
          </SettingsSection>

          {/* IOS BUDGET DATE PICKER */}
          {Platform.OS === "ios" && isBudgetDatePickerOpen && (
            <View style={styles.iosPickerContainer}>
              <DateTimePicker
                value={budgetDate}
                mode="date"
                display="spinner"
                onValueChange={(_event, selectedDate) => {
                  if (selectedDate) {
                    setBudgetDate(selectedDate);
                  }
                }}
                minimumDate={new Date()}
              />

              <Pressable
                onPress={() => setIsBudgetDatePickerOpen(false)}
                style={styles.doneButton}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Dropdown is rendered by `SettingsDropdown` inside the card trigger */}
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
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.sectionCard}>{children}</View>
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

  /* Sections */
  section: {
    marginTop: Spacing.lg,
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

  rowInput: {
    minWidth: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    padding: 10,
    fontSize: 16,
    textAlign: 'right',
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