import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "../../constants/colors";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";

type ThemeOption = "System" | "Light" | "Dark";

const themeOptions: {
  value: ThemeOption;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  description: string;
}[] = [
  {
    value: "System",
    label: "System",
    icon: "phone-portrait-outline",
    description: "Follow device",
  },
  {
    value: "Light",
    label: "Light",
    icon: "sunny-outline",
    description: "Always light",
  },
  {
    value: "Dark",
    label: "Dark",
    icon: "moon-outline",
    description: "Always dark",
  },
];

export default function AppearanceSettingsPage() {
  const [theme, setTheme] =
    useState<ThemeOption>("System");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>

        <Text style={styles.description}>
          Personalize how your finance tracker looks
          and feels.
        </Text>
      </View>

      {/* Theme */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>THEME</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>
                App theme
              </Text>

              <Text style={styles.cardDescription}>
                Choose how the app should appear.
              </Text>
            </View>

            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>
                {theme}
              </Text>
            </View>
          </View>

          <View style={styles.themeOptions}>
            {themeOptions.map((option) => {
              const selected = theme === option.value;

              return (
                <ThemeOption
                  key={option.value}
                  option={option}
                  selected={selected}
                  onPress={() =>
                    setTheme(option.value)
                  }
                />
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function ThemeOption({
  option,
  selected,
  onPress,
}: {
  option: (typeof themeOptions)[number];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{
        selected,
      }}
      style={({ pressed }) => [
        styles.themeOption,
        selected && styles.themeOptionSelected,
        pressed && styles.themeOptionPressed,
      ]}
    >
      <View
        style={[
          styles.themeIcon,
          selected && styles.themeIconSelected,
        ]}
      >
        <Ionicons
          name={option.icon}
          size={22}
          color={
            selected
              ? Colors.primary
              : Colors.textSecondary
          }
        />
      </View>

      <Text
        style={[
          styles.themeLabel,
          selected && styles.themeLabelSelected,
        ]}
      >
        {option.label}
      </Text>

      <Text style={styles.themeDescription}>
        {option.description}
      </Text>

      <View
        style={[
          styles.radio,
          selected && styles.radioSelected,
        ]}
      >
        {selected && (
          <View style={styles.radioDot} />
        )}
      </View>
    </Pressable>
  );
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

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    marginBottom: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryLight,
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
    maxWidth: 350,
    fontSize: Typography.body,
    lineHeight: 21,
    color: Colors.text,
  },

  /* Section */

  section: {
    marginBottom: Spacing.lg,
  },

  sectionTitle: {
    marginLeft: 4,
    marginBottom: Spacing.sm,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 0.7,
  },

  /* Main card */

  card: {
    padding: Spacing.md,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },

  cardHeaderText: {
    flex: 1,
    paddingRight: Spacing.sm,
  },

  cardTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },

  cardDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },

  currentBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: Colors.primaryLight,
  },

  currentBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primary,
  },

  /* Theme options */

  themeOptions: {
    flexDirection: "row",
    gap: 8,
  },

  themeOption: {
    flex: 1,
    minHeight: 112,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  themeOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },

  themeOptionPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  themeIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    marginBottom: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },

  themeIconSelected: {
    backgroundColor: Colors.surface,
  },

  themeLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 1,
  },

  themeLabelSelected: {
    color: Colors.primary,
    fontWeight: "700",
  },

  themeDescription: {
    fontSize: 9,
    lineHeight: 14,
    textAlign: "center",
    color: Colors.textSecondary,
  },

  /* Radio */

  radio: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 17,
    height: 17,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    borderColor: Colors.primary,
  },

  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },

  /* Info */

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    marginRight: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },

  infoDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
});