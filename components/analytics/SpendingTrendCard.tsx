import { StyleSheet, View, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { TimePeriod } from "./TimePeriodSelector";

type TrendPoint = {
  label: string;
  value: number;
};

type Props = {
  period: TimePeriod;
  data: TrendPoint[];
};

function formatCurrency(value: number) {
  return `₹${Math.abs(value).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function formatAxisValue(label: string) {
  const value = Number(label);

  if (!Number.isFinite(value)) {
    return label;
  }

  if (value >= 1000) {
    return `₹${Math.round(value / 1000)}k`;
  }

  return `₹${Math.round(value)}`;
}

export default function SpendingTrendCard({
  period,
  data,
}: Props) {
  const validData = data.filter(
    (point) => point.value >= 0
  );

  const total = validData.reduce(
    (sum, point) => sum + point.value,
    0
  );

  const average =
    validData.length > 0
      ? total / validData.length
      : 0;

  const highest =
    validData.length > 0
      ? Math.max(
          ...validData.map((point) => point.value)
        )
      : 0;

  const chartData = validData.map((point) => ({
    value: point.value,
    label: point.label,
  }));

  const periodLabel =
    period === "week"
      ? "Daily spending"
      : period === "month"
        ? "Daily spending"
        : period === "quarter"
          ? "Monthly spending"
          : "Spending over time";

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Spending Trend
          </Text>

          <Text style={styles.subtitle}>
            {periodLabel}
          </Text>
        </View>
      </View>

      {chartData.length > 0 ? (
        <>
          {/* Small summary */}
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>
                Average
              </Text>

              <Text style={styles.summaryValue}>
                {formatCurrency(average)}
              </Text>
            </View>

            <View style={styles.summaryRight}>
              <Text style={styles.summaryLabel}>
                Highest
              </Text>

              <Text style={styles.summaryValue}>
                {formatCurrency(highest)}
              </Text>
            </View>
          </View>

          {/* Chart */}
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              height={190}
              width={300}
              curved
              areaChart
              startFillColor="#2563EB"
              endFillColor="#FFFFFF"
              startOpacity={0.14}
              endOpacity={0.01}
              color="#2563EB"
              thickness={2.5}
              hideDataPoints={false}
              dataPointsColor="#2563EB"
              dataPointsRadius={4}
              hideRules={false}
              rulesColor="#E5E7EB"
              rulesType="dashed"
              rulesThickness={1}
              yAxisColor="transparent"
              xAxisColor="#E5E7EB"
              yAxisTextStyle={styles.axisText}
              xAxisLabelTextStyle={styles.axisText}
              formatYLabel={formatAxisValue}
              initialSpacing={12}
              endSpacing={12}
              noOfSections={4}
              maxValue={
                highest > 0
                  ? Math.ceil(highest * 1.15)
                  : 100
              }
              spacing={
                chartData.length > 1
                  ? Math.max(
                      32,
                      Math.min(
                        55,
                        260 /
                          (chartData.length - 1)
                      )
                    )
                  : 50
              }
              showVerticalLines={false}
              hideOrigin={true}
              pointerConfig={{
                pointerStripHeight: 180,
                pointerStripColor: "#CBD5E1",
                pointerStripWidth: 1,
                pointerColor: "#2563EB",
                radius: 5,
                pointerLabelWidth: 100,
                pointerLabelHeight: 55,
                activatePointersOnLongPress: true,
                autoAdjustPointerLabelPosition: true,
                pointerLabelComponent: (
                  items: any[]
                ) => {
                  const item = items?.[0];

                  if (!item) {
                    return null;
                  }

                  return (
                    <View style={styles.tooltip}>
                      <Text style={styles.tooltipLabel}>
                        {item.label}
                      </Text>

                      <Text style={styles.tooltipValue}>
                        {formatCurrency(item.value)}
                      </Text>
                    </View>
                  );
                },
              }}
            />
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            No spending data
          </Text>

          <Text style={styles.emptyText}>
            Spending trends will appear here once
            you have transactions.
          </Text>
        </View>
      )}
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

  header: {
    marginBottom: 16,
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

  /* Summary */

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 12,
  },

  summaryRight: {
    alignItems: "flex-end",
  },

  summaryLabel: {
    fontSize: 10,
    fontWeight: "600",

    color: "#9CA3AF",
  },

  summaryValue: {
    marginTop: 3,

    fontSize: 14,
    fontWeight: "800",

    color: "#374151",
  },

  /* Chart */

  chartContainer: {
    marginLeft: -18,
    marginRight: -18,

    overflow: "hidden",
  },

  axisText: {
    fontSize: 9,
    color: "#94A3B8",
  },

  /* Tooltip */

  tooltip: {
    minWidth: 80,

    paddingHorizontal: 9,
    paddingVertical: 7,

    borderRadius: 9,

    backgroundColor: "#111827",
  },

  tooltipLabel: {
    fontSize: 9,
    fontWeight: "600",

    color: "#9CA3AF",
  },

  tooltipValue: {
    marginTop: 2,

    fontSize: 12,
    fontWeight: "800",

    color: "#FFFFFF",
  },

  /* Empty */

  emptyState: {
    minHeight: 220,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",

    color: "#475569",
  },

  emptyText: {
    marginTop: 5,

    fontSize: 11,
    lineHeight: 17,

    textAlign: "center",

    color: "#94A3B8",
  },
});