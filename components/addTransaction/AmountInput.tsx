import {
  Text,
  TextInput,
  StyleSheet,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { useController, useFormContext } from "react-hook-form";

import { TransactionFormValues } from "../../schemas/transactionSchema";
import { Colors } from "../../constants/colors";
import { Radius } from "../../constants/radius";
import { Spacing } from "../../constants/spacing";

export default function AmountInput() {
  const { control } = useFormContext<TransactionFormValues>();

  const {
    field,
    fieldState: { error },
  } = useController({
    name: "amount",
    control,
  });

  const [inputValue, setInputValue] = useState(
    field.value === 0 ? "" : String(field.value)
  );

  useEffect(() => {
    if (field.value === 0) {
      setInputValue("");
    } else if (String(field.value) !== inputValue) {
      setInputValue(String(field.value));
    }
  }, [field.value]);

  const handleChangeText = (text: string) => {
    // Allow only numbers and decimal point
    let value = text.replace(/[^0-9.]/g, "");

    // Allow only one decimal point
    const parts = value.split(".");

    if (parts.length > 2) {
      value = `${parts[0]}.${parts.slice(1).join("")}`;
    }

    setInputValue(value);

    // Don't convert incomplete decimal values
    // e.g. "12." should remain "12."
    if (value === "" || value === ".") {
      field.onChange(0);
      return;
    }

    const numericValue = Number(value);

    if (!Number.isNaN(numericValue)) {
      field.onChange(numericValue);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="₹ 0.00"
        keyboardType="decimal-pad"
        value={inputValue}
        onChangeText={handleChangeText}
        onBlur={field.onBlur}
        style={[
          styles.input,
          error && styles.errorBorder,
        ]}
      />

      {error && (
        <Text style={styles.errorText}>
          {error.message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },

  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    padding: 14,
    fontSize: 20,
  },

  errorBorder: {
    borderColor: Colors.danger,
  },

  errorText: {
    color: Colors.danger,
    fontSize: 12,
  },
});