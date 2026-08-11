import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "../../../theme/colors";
import { Spacing } from "../../../theme/spacing";
import { Typography } from "../../../theme/typography";

/**
 * @param {{
 *   icon?: string;
 *   title: string;
 *   description?: string;
 *   children?: React.ReactNode;
 *   onPress?: () => void;
 * }} props
 */
export default function SettingsCard({
  icon,
  title,
  description,
  children,
  onPress,
}) {
  const content = (
    <View style={styles.card}>
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon}
            size={22}
            color={Colors.primary}
          />
        </View>
      )}

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        
        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>

      {children && (
        <View style={styles.trailing}>
          {children}
        </View>
      )}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.cardPressed,
      ]}
      android_ripple={{ color: Colors.primaryLight }}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
    borderRadius: 16,
  },

  card: {
    width: "100%",
    minHeight: 80,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: Typography.body,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },

  description: {
    fontSize: Typography.caption,
    lineHeight: 18,
    color: Colors.textSecondary,
  },

  trailing: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});