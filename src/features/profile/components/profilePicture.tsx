import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/theme/colors";
import { Spacing } from "@/theme/spacing";

interface ProfilePictureProps {
  name: string;
  pictureUri: string | null;
  disabled?: boolean;
  onPress: () => void;
}

export default function ProfilePicture({
  name,
  pictureUri,
  disabled = false,
  onPress,
}: ProfilePictureProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Choose profile picture"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && !disabled && styles.pressed]}
    >
      <View style={styles.avatar}>
        {pictureUri ? (
          <Image source={{ uri: pictureUri }} style={styles.image} />
        ) : (
          <Text style={styles.initial}>{initial}</Text>
        )}
      </View>
      <View style={styles.editBadge}>
        <Ionicons name="camera" size={14} color={Colors.surface} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { width: 120, height: 120, position: "relative" },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryLight,
    borderWidth: 4,
    borderColor: Colors.surface,
  },
  image: { width: "100%", height: "100%" },
  initial: { fontSize: 48, fontWeight: "800", color: Colors.primary },
  editBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
});

