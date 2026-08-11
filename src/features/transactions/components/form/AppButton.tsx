import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { Colors } from "../../../../theme/colors";
import { Radius } from "../../../../theme/radius";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
}

export default function AppButton({
  title,
  onPress,
  loading = false,
}: AppButtonProps) {
  return (
    <Pressable
      style={[
        styles.button,
        loading && styles.disabled,
      ]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radius.md,
    alignItems: "center",
  },

  disabled: {
    opacity: 0.6,
  },

  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});