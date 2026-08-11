import { StyleSheet, View, Text } from "react-native";

type Insight = {
  question: string;
  answer: string;
  accent?: "blue" | "green" | "red" | "amber";
};

type Props = {
  insights: Insight[];
};

const ACCENT_COLORS = {
  blue: "#2563EB",
  green: "#16A34A",
  red: "#DC2626",
  amber: "#D97706",
};

export default function SpendingInsightsCard({
  insights,
}: Props) {
  const visibleInsights = insights.slice(0, 5);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Spending Insights
        </Text>

        <Text style={styles.subtitle}>
          What your spending is telling you
        </Text>
      </View>

      {/* Insights */}
      <View style={styles.list}>
        {visibleInsights.map((insight, index) => {
          const accent =
            ACCENT_COLORS[insight.accent ?? "blue"];

          const isLast =
            index === visibleInsights.length - 1;

          return (
            <View
              key={`${insight.question}-${index}`}
              style={[
                styles.insight,
                !isLast && styles.insightBorder,
              ]}
            >
              <View
                style={[
                  styles.indicator,
                  {
                    backgroundColor: accent,
                  },
                ]}
              />

              <View style={styles.content}>
                <Text style={styles.question}>
                  {insight.question}
                </Text>

                <Text style={styles.answer}>
                  {insight.answer}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,

    padding: 18,
    marginBottom: 16,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 3,
  },

  /* Header */

  header: {
    marginBottom: 8,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",

    color: "#111827",

    letterSpacing: -0.2,
  },

  subtitle: {
    marginTop: 3,

    fontSize: 11,
    fontWeight: "500",

    color: "#9CA3AF",
  },

  /* Insights */

  list: {
    marginTop: 4,
  },

  insight: {
    flexDirection: "row",

    paddingVertical: 14,
  },

  insightBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  indicator: {
    width: 5,
    height: 34,

    borderRadius: 999,

    marginTop: 2,
    marginRight: 12,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  question: {
    fontSize: 13,
    fontWeight: "700",

    color: "#374151",

    lineHeight: 18,
  },

  answer: {
    marginTop: 4,

    fontSize: 12,
    fontWeight: "500",

    color: "#64748B",

    lineHeight: 18,
  },
});