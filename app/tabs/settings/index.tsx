import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import SettingsCard from "../../../components/settings/SettingsCard";

import { Colors } from "../../../constants/colors";
import { Spacing } from "../../../constants/spacing";
import { Typography } from "../../../constants/typography";

const settingsCategories = [
  {
    icon: "color-palette-outline",
    title: "Appearance",
    description:
      "Customize the look and display of your finance tracker.",
    href: "/tabs/settings/appearance",
  },
  {
    icon: "receipt-outline",
    title: "Transactions Settings",
    description:
      "Manage transaction preferences and default behavior.",
    href: "/tabs/settings/transactions",
  },
  {
    icon: "receipt-outline",
    title: "Budget",
    description: "Budget preferences and limits",
    href: "/tabs/settings/budget",
  },
  {
    icon: "wallet-outline",
    title: "Accounts",
    description:
      "Manage your financial accounts and balances.",
    href: "/tabs/settings/accounts",
  },
  {
    icon: "pricetags-outline",
    title: "Categories",
    description:
      "Manage categories used for your transactions.",
    href: "/tabs/settings/categories",
  },
  {
    icon: "pricetags-outline",
    title: "Notifications",
    description: "Notification settings",
    href: "/tabs/settings/notifications",
  },
  {
    icon: "server-outline",
    title: "Data & Backup",
    description:
      "Export, import and manage your financial data.",
    href: "/tabs/settings/data-backup",
  },
  {
    icon: "information-circle-outline",
    title: "About",
    description:
      "App information, privacy and terms.",
    href: "/tabs/settings/about",
  },
];

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>

        <Text style={styles.subtitle}>
          Manage how your finance tracker looks and behaves.
        </Text>
      </View>

      <View style={styles.grid}>
        {settingsCategories.map((item) => (
          <SettingsCard
            key={item.title}
            icon={item.icon}
            title={item.title}
            description={item.description}
            onPress={() => router.push(item.href)}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.textSecondary}
            />
          </SettingsCard>
        ))}
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

  header: {
    marginBottom: Spacing.xl,
  },

  title: {
    fontSize: Typography.title,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  grid: {
    flexDirection: "column",
    gap: Spacing.md,
  },
});