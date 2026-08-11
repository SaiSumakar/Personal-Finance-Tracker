import { Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

interface FormLabelProps {
  title: string;
}

export default function FormLabel({ title }: FormLabelProps) {
  return <Text style={styles.label}>{title}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
  },
});