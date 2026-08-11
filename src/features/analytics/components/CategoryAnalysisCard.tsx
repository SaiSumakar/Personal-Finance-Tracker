import { StyleSheet, View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";

type Category = {
  label: string;
  amount: number;
};

type Props = {
  categories: Category[];
};

const CATEGORY_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#D97706",
  "#16A34A",
  "#0891B2",
  "#4F46E5",
  "#EA580C",
];

function formatCurrency(value: number) {
  return `₹${Math.abs(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export default function CategoryAnalysisCard({
  categories,
}: Props) {
  const validCategories = categories.filter(
    (category) => category.amount > 0
  );

  const total = validCategories.reduce(
    (sum, category) => sum + category.amount,
    0
  );

  const hasData = total > 0;

  const chartData = validCategories.map(
    (category, index) => ({
      value: category.amount,
      color:
        CATEGORY_COLORS[
          index % CATEGORY_COLORS.length
        ],
    })
  );

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Category Analysis
        </Text>

        <Text style={styles.subtitle}>
          Where your money is going
        </Text>
      </View>

      {/* Donut */}
      <View style={styles.chartSection}>
        {hasData ? (
          <View style={styles.chartWrapper}>
            <PieChart
              data={chartData}
              donut
              radius={82}
              innerRadius={58}
              innerCircleColor="#FFFFFF"
              strokeWidth={2}
              strokeColor="#FFFFFF"
              focusOnPress={false}
              showValuesAsLabels={false}
              centerLabelComponent={() => (
                <View style={styles.chartCenter}>
                  <Text style={styles.centerLabel}>
                    Total
                  </Text>

                  <Text
                    style={styles.centerAmount}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {formatCurrency(total)}
                  </Text>
                </View>
              )}
            />
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>
              No spending yet
            </Text>
          </View>
        )}
      </View>

      {/* Legend */}
      {hasData && (
        <View style={styles.legend}>
          {validCategories.map(
            (category, index) => {
              const percentage =
                (category.amount / total) * 100;

              const color =
                CATEGORY_COLORS[
                  index % CATEGORY_COLORS.length
                ];

              return (
                <View
                  key={category.label}
                  style={styles.legendRow}
                >
                  <View style={styles.legendLeft}>
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: color,
                        },
                      ]}
                    />

                    <Text
                      style={styles.categoryName}
                      numberOfLines={1}
                    >
                      {category.label}
                    </Text>
                  </View>

                  <View style={styles.legendRight}>
                    <Text style={styles.categoryAmount}>
                      {formatCurrency(category.amount)}
                    </Text>

                    <Text
                      style={
                        styles.categoryPercentage
                      }
                    >
                      {Math.round(percentage)}%
                    </Text>
                  </View>
                </View>
              );
            }
          )}
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

  /* Header */

  header: {
    marginBottom: 4,
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

  /* Chart */

  chartSection: {
    alignItems: "center",
    justifyContent: "center",

    marginTop: 12,
    marginBottom: 12,
  },

  chartWrapper: {
    width: 190,
    height: 190,

    alignItems: "center",
    justifyContent: "center",
  },

  chartCenter: {
    width: 105,

    alignItems: "center",
    justifyContent: "center",
  },

  centerLabel: {
    fontSize: 10,
    fontWeight: "600",

    color: "#9CA3AF",
  },

  centerAmount: {
    marginTop: 4,

    fontSize: 18,
    fontWeight: "800",

    color: "#111827",

    letterSpacing: -0.4,

    textAlign: "center",
  },

  /* Empty state */

  emptyChart: {
    width: 164,
    height: 164,

    borderRadius: 82,

    backgroundColor: "#F8FAFC",

    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    fontSize: 12,
    fontWeight: "600",

    color: "#94A3B8",
  },

  /* Legend */

  legend: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",

    paddingTop: 8,
  },

  legendRow: {
    minHeight: 40,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  legendLeft: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",

    minWidth: 0,
  },

  dot: {
    width: 8,
    height: 8,

    borderRadius: 999,

    marginRight: 9,
  },

  categoryName: {
    flex: 1,

    fontSize: 13,
    fontWeight: "600",

    color: "#374151",
  },

  legendRight: {
    flexDirection: "row",
    alignItems: "center",

    marginLeft: 12,
  },

  categoryAmount: {
    fontSize: 13,
    fontWeight: "700",

    color: "#111827",
  },

  categoryPercentage: {
    width: 38,

    marginLeft: 10,

    fontSize: 11,
    fontWeight: "600",

    color: "#9CA3AF",

    textAlign: "right",
  },
});