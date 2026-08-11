import {
  Text,
  TextInput,
  StyleSheet,
  View,
} from "react-native";
import { useController, useFormContext } from "react-hook-form";

import { TransactionFormValues } from "../../schemas/transactionSchema";
import { Colors } from "../../constants/colors";
import { Radius } from "../../constants/radius";
import { Spacing } from "../../constants/spacing";

export default function AmountInput() {
  const { control } =
    useFormContext<TransactionFormValues>();

  const {
    field,
    fieldState: { error },
  } = useController({
    name: "amount",
    control,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Amount
      </Text>

      <TextInput
        placeholder="₹ 0.00"
        keyboardType="decimal-pad"
        value={
          field.value === 0
            ? ""
            : String(field.value)
        }
        onChangeText={(text) => {
          const numericValue =
            text === "" ? 0 : Number(text);

          field.onChange(numericValue);
        }}
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

  label: {
    fontWeight: "600",
    color: Colors.text,
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