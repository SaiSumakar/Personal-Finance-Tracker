import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "../../../src/theme/colors";
import { Spacing } from "../../../src/theme/spacing";
import { Typography } from "../../../src/theme/typography";

type IoniconName = React.ComponentProps<
  typeof Ionicons
>["name"];

type SettingItem = {
  icon: IoniconName;
  title: string;
  description: string;
  href: string;
};

type SettingSection = {
  title: string;
  items: SettingItem[];
};

const settingsSections: SettingSection[] = [
  {
    title: "Preferences",
    items: [
      {
        icon: "color-palette-outline",
        title: "Appearance",
        description: "Theme, colors and display preferences",
        href: "/(tabs)/settings/appearance",
      },
      {
        icon: "receipt-outline",
        title: "Transactions",
        description: "Defaults and transaction behavior",
        href: "/(tabs)/settings/transactions",
      },
      {
        icon: "notifications-outline",
        title: "Notifications",
        description: "Reminders and notification preferences",
        href: "/(tabs)/settings/notifications",
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        icon: "wallet-outline",
        title: "Accounts",
        description: "Manage your accounts and balances",
        href: "/(tabs)/settings/accounts",
      },
      {
        icon: "pricetags-outline",
        title: "Categories",
        description: "Organize your income and expenses",
        href: "/(tabs)/settings/categories",
      },
      {
        icon: "pie-chart-outline",
        title: "Budget",
        description: "Set spending limits and budget preferences",
        href: "/(tabs)/settings/budget",
      },
    ],
  },
  {
    title: "Data & App",
    items: [
      {
        icon: "cloud-upload-outline",
        title: "Data & Backup",
        description: "Export, import and protect your data",
        href: "/(tabs)/settings/data-backup",
      },
      {
        icon: "information-circle-outline",
        title: "About",
        description: "App information, privacy and terms",
        href: "/(tabs)/settings/about",
      },
    ],
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

      {/* Sections */}
      {settingsSections.map((section) => (
        <View
          key={section.title}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>
            {section.title}
          </Text>

          <View style={styles.sectionCard}>
            {section.items.map((item, index) => (
              <SettingRow
                key={item.title}
                item={item}
                isLast={
                  index === section.items.length - 1
                }
                onPress={() => router.push(item.href)}
              />
            ))}
          </View>
        </View>
      ))}

      <Text style={styles.footerText}>
        Your financial data stays on your device unless
        you choose to export or back it up.
      </Text>
    </ScrollView>
  );
}

function SettingRow({
  item,
  isLast,
  onPress,
}: {
  item: SettingItem;
  isLast: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{
        color: Colors.primaryLight,
      }}
      style={({ pressed }) => [
        styles.rowPressable,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={item.icon}
            size={21}
            color={Colors.primary}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.rowTitle}>
            {item.title}
          </Text>

          <Text
            style={styles.rowDescription}
            numberOfLines={1}
          >
            {item.description}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={Colors.textSecondary}
        />
      </View>

      {!isLast && <View style={styles.divider} />}
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

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },

  subtitle: {
    maxWidth: 340,
    fontSize: Typography.body,
    lineHeight: 21,
    color: Colors.textSecondary,
  },

  /* Sections */

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
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  sectionCard: {
    overflow: "hidden",
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  /* Row */

  rowPressable: {
    width: "100%",
  },

  rowPressed: {
    backgroundColor: Colors.primaryLight,
  },

  row: {
    minHeight: 74,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    marginRight: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryLight,
  },

  textContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: Spacing.sm,
  },

  rowTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },

  rowDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 72,
    backgroundColor: Colors.border,
  },

  /* Footer */

  footerText: {
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.xs,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    color: Colors.textSecondary,
  },
});