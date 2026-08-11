import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../../constants/colors";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";

type SettingsPlaceholderScreenProps = {
  title: string;
  description: string;
};

export default function SettingsPlaceholderScreen({
  title,
  description,
}: SettingsPlaceholderScreenProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="construct-outline"
            size={28}
            color={Colors.primary}
          />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.divider} />

        <Text style={styles.comingSoon}>Coming Soon</Text>
        <Text style={styles.supportingText}>
          This section will be implemented later.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: "center",
    backgroundColor: Colors.background,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryLight,
    marginBottom: Spacing.lg,
  },

  title: {
    fontSize: Typography.heading,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },

  description: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.xl,
  },

  comingSoon: {
    fontSize: Typography.subheading,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  supportingText: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
