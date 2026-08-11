import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Control, FieldPath, FieldValues, useController } from "react-hook-form";

import FormLabel from "./FormLabel";
import { Colors } from "../../../../theme/colors";
import { Radius } from "../../../../theme/radius";

export interface SelectOption {
  label: string;
  value: string | number;
}

interface AppSelectProps<T extends FieldValues> {
  label: string;
  name: FieldPath<T>;
  control: Control<T>;
  options: SelectOption[];
  placeholder?: string;
}

export default function AppSelect<T extends FieldValues>({
  label,
  name,
  control,
  options,
  placeholder,
}: AppSelectProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <View style={styles.container}>
      <FormLabel title={label} />

      <View
        style={[
          styles.pickerContainer,
          error && styles.errorBorder,
        ]}
      >
        <Picker
          selectedValue={field.value}
          onValueChange={field.onChange}
          onBlur={field.onBlur}
        >
          {placeholder && (
            <Picker.Item
              label={placeholder}
              value={0}
            />
          )}

          {options.map((item) => (
            <Picker.Item
              key={item.value.toString()}
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      </View>

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
    gap: 4,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    overflow: "hidden",
  },

  errorBorder: {
    borderColor: Colors.danger,
  },

  errorText: {
    color: Colors.danger,
    fontSize: 12,
  },
});