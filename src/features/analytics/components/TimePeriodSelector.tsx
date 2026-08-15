import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type TimePeriod =
  | "week"
  | "month"
  | "quarter"
  | "custom";

type Props = {
  value?: TimePeriod;
  onChange?: (period: TimePeriod) => void;
};

const options: {
  value: TimePeriod;
  label: string;
}[] = [
  {
    value: "week",
    label: "This week",
  },
  {
    value: "month",
    label: "This month",
  },
  {
    value: "quarter",
    label: "This quarter",
  },
];

export default function TimePeriodSelector({
  value = "month",
  onChange,
}: Props) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange?.(option.value)}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{
                selected: isSelected,
              }}
              accessibilityLabel={`Select ${option.label}`}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  scrollContent: {
    gap: 8,
  },

  option: {
    minHeight: 40,

    paddingHorizontal: 15,

    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  optionSelected: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },

  optionPressed: {
    opacity: 0.7,
  },

  optionText: {
    fontSize: 12,
    fontWeight: "600",

    color: "#64748B",
  },

  optionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
