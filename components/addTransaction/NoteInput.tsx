import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";
import { useController, useFormContext } from "react-hook-form";

import { TransactionFormValues } from "../../schemas/transactionSchema";
import { Colors } from "../../constants/colors";
import { Radius } from "../../constants/radius";
import { Spacing } from "../../constants/spacing";

export default function NoteInput() {
  const { control } =
    useFormContext<TransactionFormValues>();

  const { field } = useController({
    name: "note",
    control,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Note
      </Text>

      <TextInput
        placeholder="Optional note"
        multiline
        numberOfLines={3}
        value={field.value ?? ""}
        onChangeText={field.onChange}
        onBlur={field.onBlur}
        style={styles.input}
      />
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
    minHeight: 90,
    textAlignVertical: "top",
  },
});