import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SettingsCard from "../../components/settings/SettingsCard";

import { Colors } from "../../constants/colors";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";

export default function AppearanceSettingsPage() {
  const [theme, setTheme] = useState("System");
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const themeOptions = ["System", "Light", "Dark"];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.description}>
        Customize the look and display of your finance tracker.
      </Text>

      <View style={styles.settingsContainer}>
        <SettingsCard
          // icon="color-palette-outline"
          title="Theme"
          description="Choose app appearance"
        >
          <Pressable
            onPress={() => setIsThemeOpen((previous) => !previous)}
            style={styles.dropdown}
          >
            <Text style={styles.dropdownText}>{theme}</Text>

            <Ionicons
              name={isThemeOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={Colors.textSecondary}
            />
          </Pressable>
        </SettingsCard>

        {isThemeOpen && (
          <>
            <Pressable
              style={styles.dropdownBackdrop}
              onPress={() => setIsThemeOpen(false)}
            />

            <View style={styles.dropdownOptions}>
              {themeOptions.map((option) => {
                const isSelected = option === theme;

                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setTheme(option);
                      setIsThemeOpen(false);
                    }}
                    style={[
                      styles.dropdownOption,
                      isSelected && styles.dropdownOptionSelected,
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
          </>
        )}
      </View>
    </ScrollView>
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

  settingsContainer: {
    position: "relative",
    zIndex: 10,
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

  dropdownOptions: {
    position: "absolute",
    top: 72,
    right: Spacing.lg,
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
    zIndex: 30,
  },

  dropdownOption: {
    minHeight: 48,
    paddingHorizontal: Spacing.md,
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

  dropdownBackdrop: {
    position: "absolute",
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 20,
  },
});