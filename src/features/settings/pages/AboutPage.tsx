import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/theme/colors";
import { Spacing } from "@/theme/spacing";

const APP_VERSION = "1.0.0";

export default function AboutPage() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* App Info */}
        <View style={styles.appCard}>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>Trace</Text>

            <Text style={styles.description}>
              A simple and private way to manage your
              personal finances.
            </Text>

            <Text style={styles.tagline}>
              Know where your money goes.
            </Text>
          </View>

          <View style={styles.versionBadge}>
            <Text style={styles.version}>
              v{APP_VERSION}
            </Text>
          </View>
        </View>

        {/* Privacy */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <View style={styles.privacyIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color={Colors.primary}
              />
            </View>

            <View>
              <Text style={styles.privacyTitle}>
                Private by design
              </Text>

              <Text style={styles.privacySubtitle}>
                Your finances stay yours.
              </Text>
            </View>
          </View>

          <Text style={styles.privacyText}>
            Your financial data is stored locally on your
            device. No account, cloud storage, or internet
            connection is required.
          </Text>

          <View style={styles.features}>
            <Feature
              icon="cloud-offline-outline"
              text="Works offline"
            />

            <Feature
              icon="phone-portrait-outline"
              text="Local data"
            />

            <Feature
              icon="eye-off-outline"
              text="No tracking"
            />
          </View>
        </View>

        {/* Key Details */}
        <View style={styles.detailsCard}>
          <Detail
            icon="lock-closed-outline"
            title="Your data stays private"
          />

          <Detail
            icon="server-outline"
            title="Stored on your device"
          />

          <Detail
            icon="wifi-outline"
            title="No internet required"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made for personal use
          </Text>

          <View style={styles.footerDot} />

          <Text style={styles.footerText}>
            Version {APP_VERSION}
          </Text>
        </View>
      </View>
    </View>
  );
}

function Feature({
  icon,
  text,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text: string;
}) {
  return (
    <View style={styles.feature}>
      <Ionicons
        name={icon}
        size={14}
        color={Colors.primary}
      />

      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function Detail({
  icon,
  title,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
}) {
  return (
    <View style={styles.detail}>
      <View style={styles.detailIcon}>
        <Ionicons
          name={icon}
          size={17}
          color={Colors.textSecondary}
        />
      </View>

      <Text style={styles.detailText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  /* App Info */

  appCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  appInfo: {
    flex: 1,
    paddingRight: Spacing.md,
  },

  appName: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.4,
    marginBottom: 5,
  },

  description: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginBottom: 6,
  },

  tagline: {
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
    color: Colors.primary,
  },

  versionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.primaryLight,
  },

  version: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primary,
  },

  /* Privacy */

  privacyCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  privacyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },

  privacyIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    marginRight: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },

  privacyTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: Colors.text,
  },

  privacySubtitle: {
    fontSize: 10,
    lineHeight: 15,
    color: Colors.textSecondary,
  },

  privacyText: {
    fontSize: 11,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },

  features: {
    flexDirection: "row",
    gap: 7,
  },

  feature: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 7,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },

  featureText: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
  },

  /* Details */

  detailsCard: {
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  detail: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 58,
  },

  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },

  detailText: {
    marginLeft: Spacing.sm,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.text,
  },

  /* Footer */

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
    paddingTop: Spacing.lg,
  },

  footerText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },

  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 99,
    marginHorizontal: 8,
    backgroundColor: Colors.textSecondary,
  },
});