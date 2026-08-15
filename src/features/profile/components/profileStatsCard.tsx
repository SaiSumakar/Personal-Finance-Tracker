import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/theme/colors";
import { Spacing } from "@/theme/spacing";
import { Typography } from "@/theme/typography";
import type { ProfileStats } from "../types/profile";

interface ProfileStatsCardProps { stats: ProfileStats }

function formatCurrency(value: number) {
  return `₹${Math.abs(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatTrackingSince(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-US", { month: "short", year: "numeric" });
}

export default function ProfileStatsCard({ stats }: ProfileStatsCardProps) {
  const keyMetrics = [
    { label: "Tracking since", value: formatTrackingSince(stats.trackingSince) },
    { label: "Transactions", value: stats.transactions.toLocaleString("en-IN") },
  ];

  const financialMetrics = [
    { label: "Total income", value: formatCurrency(stats.totalIncome) },
    { label: "Total expenses", value: formatCurrency(stats.totalExpenses) },
  ];

  const summaryMetrics = [
    { label: "Categories used", value: stats.categoriesUsed.toLocaleString("en-IN") },
    { label: "Current savings", value: `${stats.currentSavings < 0 ? "-" : ""}${formatCurrency(stats.currentSavings)}`, isSavings: true },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Your financial journey</Text>
      <Text style={styles.description}>A snapshot of everything you have tracked.</Text>

      <View style={styles.metricsGroup}>
        {keyMetrics.map((item) => (
          <View key={item.label} style={styles.metricRow}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.metricsGroup}>
        {financialMetrics.map((item) => (
          <View key={item.label} style={styles.metricRow}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.metricsGroup}>
        {summaryMetrics.map((item) => (
          <View key={item.label} style={styles.metricRow}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={[styles.value, item.isSavings && stats.currentSavings >= 0 && styles.savings]}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.lg, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  title: { fontSize: Typography.caption, fontWeight: "700", color: Colors.text },
  description: { marginTop: Spacing.xs, fontSize: Typography.small, lineHeight: 17, color: Colors.textSecondary },
  metricsGroup: { marginTop: Spacing.md },
  metricRow: { minHeight: 38, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: Spacing.sm },
  label: { flex: 1, fontSize: Typography.small, color: Colors.textSecondary },
  value: { marginLeft: Spacing.md, fontSize: Typography.body, fontWeight: "600", color: Colors.text },
  savings: { color: Colors.success },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
});
