import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from "react-hook-form";

import FormLabel from "./FormLabel";
import { Colors } from "../../constants/colors";
import { Radius } from "../../constants/radius";

interface AppDatePickerProps<T extends FieldValues> {
  label: string;
  name: FieldPath<T>;
  control: Control<T>;
}

export default function AppDatePicker<T extends FieldValues>({
  label,
  name,
  control,
}: AppDatePickerProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const [showPicker, setShowPicker] = useState(false);

  const value =
    (field.value as any) instanceof Date
      ? field.value
      : new Date();

  const formattedDate = value.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

  const handleChange = (
    event: any,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (selectedDate) {
      field.onChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <FormLabel title={label} />

      <Pressable
        style={[
          styles.dateButton,
          error && styles.errorBorder,
        ]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.dateText}>
          {formattedDate}
        </Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display={
            Platform.OS === "ios"
              ? "spinner"
              : "default"
          }
          onValueChange={handleChange}
          maximumDate={new Date()}
        />
      )}

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

  dateButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    padding: 15,
  },

  dateText: {
    color: Colors.text,
    fontSize: 16,
  },

  errorBorder: {
    borderColor: Colors.danger,
  },

  errorText: {
    color: Colors.danger,
    fontSize: 12,
  },
});