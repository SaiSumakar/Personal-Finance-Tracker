import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { useFormContext } from "react-hook-form";

import { TransactionFormValues } from "../schemas/transactionSchema";
import { Colors } from "../../../theme/colors";
import { Radius } from "../../../theme/radius";

export default function TransactionTypeToggle() {
  const {
    watch,
    setValue,
  } = useFormContext<TransactionFormValues>();

  const selectedType = watch("type");

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          selectedType === "expense" &&
            styles.active,
        ]}
        onPress={() =>
          setValue("type", "expense")
        }
      >
        <Text
          style={[
            styles.text,
            selectedType === "expense" &&
              styles.activeText,
          ]}
        >
          Expense
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.button,
          selectedType === "income" &&
            styles.active,
        ]}
        onPress={() =>
          setValue("type", "income")
        }
      >
        <Text
          style={[
            styles.text,
            selectedType === "income" &&
              styles.activeText,
          ]}
        >
          Income
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  button: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },

  active: {
    backgroundColor: Colors.primary,
  },

  text: {
    color: Colors.text,
    fontWeight: "600",
  },

  activeText: {
    color: "#fff",
  },
});