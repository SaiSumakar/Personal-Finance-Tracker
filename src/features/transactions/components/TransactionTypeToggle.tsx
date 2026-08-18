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

  const handleTypeChange = (
    type: TransactionFormValues["type"]
  ) => {
    setValue("type", type);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          selectedType === "expense" &&
            styles.active,
        ]}
        onPress={() =>
          handleTypeChange("expense")
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
          handleTypeChange("income")
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

      <Pressable
        style={[
          styles.button,
          selectedType === "transfer" &&
            styles.active,
        ]}
        onPress={() =>
          handleTypeChange("transfer")
        }
      >
        <Text
          style={[
            styles.text,
            selectedType === "transfer" &&
              styles.activeText,
          ]}
        >
          Transfer
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
    justifyContent: "center",
  },

  active: {
    backgroundColor: Colors.primary,
  },

  text: {
    color: Colors.text,
    fontWeight: "600",
    fontSize: 13,
  },

  activeText: {
    color: "#fff",
  },
});