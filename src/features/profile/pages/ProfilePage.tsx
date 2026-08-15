import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Colors } from "@/theme/colors";
import { Spacing } from "@/theme/spacing";
import { Typography } from "@/theme/typography";

import ProfilePicture from "../components/profilePicture";
import ProfileStatsCard from "../components/profileStatsCard";
import { useProfileStore } from "../stores/profileStore";

export default function ProfilePage() {
  const { data, error, isLoading, isSaving, loadProfile, replaceProfilePicture, updatePreferredName } = useProfileStore();
  const [nameDraft, setNameDraft] = useState<string | null>(null);

  useFocusEffect(useCallback(() => { void loadProfile(); }, [loadProfile]));

  const chooseProfilePicture = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo permission needed", "Allow photo library access to choose a profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (!result.canceled && result.assets[0]) await replaceProfilePicture(result.assets[0].uri);
  };

  const savePreferredName = async () => {
    if (await updatePreferredName(preferredName)) {
      setNameDraft(preferredName.trim());
      Alert.alert("Saved", "Your preferred name has been updated.");
    }
  };

  if (isLoading && !data) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!data) return <View style={styles.center}><Text style={styles.errorText}>{error ?? "Unable to load your profile."}</Text></View>;

  const preferredName = nameDraft ?? data.profile.preferred_name;
  const hasNameChanges = preferredName.trim() !== data.profile.preferred_name;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <ProfilePicture name={data.profile.preferred_name} pictureUri={data.profile.picture_uri} disabled={isSaving} onPress={() => void chooseProfilePicture()} />
          <Text style={styles.heroTitle}>{data.profile.preferred_name || "Your profile"}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edit profile</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Preferred name</Text>
              <TextInput value={preferredName} onChangeText={setNameDraft} placeholder="What should we call you?" placeholderTextColor={Colors.placeholder} maxLength={50} editable={!isSaving} returnKeyType="done" onSubmitEditing={() => void savePreferredName()} style={styles.input} />
            </View>
            <Pressable accessibilityRole="button" disabled={!hasNameChanges || isSaving} onPress={() => void savePreferredName()} style={({ pressed }) => [styles.saveButton, (!hasNameChanges || isSaving) && styles.saveButtonDisabled, pressed && styles.pressed]}>
              {isSaving ? <ActivityIndicator color={Colors.surface} /> : <Text style={styles.saveButtonText}>Save changes</Text>}
            </Pressable>
          </View>
        </View>
        <View style={styles.section}>
          <ProfileStatsCard stats={data.stats} />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.xl, backgroundColor: "#F5F7FB" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.xl },
  backButton: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  title: { marginLeft: Spacing.md, fontSize: Typography.heading, fontWeight: "800", color: Colors.text },
  hero: { alignItems: "center", marginBottom: Spacing.xxl },
  heroTitle: { marginTop: Spacing.md, fontSize: Typography.subheading, fontWeight: "700", color: Colors.text },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { marginBottom: Spacing.md, fontSize: Typography.caption, fontWeight: "700", letterSpacing: 0.5, color: Colors.text },
  card: { padding: Spacing.lg, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  inputGroup: { marginBottom: Spacing.lg },
  fieldLabel: { marginBottom: Spacing.sm, fontSize: Typography.small, fontWeight: "600", color: Colors.text },
  input: { height: 44, paddingHorizontal: Spacing.md, borderRadius: 10, borderWidth: 1, borderColor: Colors.borderStrong, fontSize: Typography.body, color: Colors.text, backgroundColor: Colors.background },
  saveButton: { height: 44, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: Colors.primary },
  saveButtonDisabled: { backgroundColor: Colors.disabled },
  saveButtonText: { fontSize: Typography.caption, fontWeight: "700", color: Colors.surface },
  pressed: { opacity: 0.85 },
  errorText: { fontSize: Typography.caption, color: Colors.danger, textAlign: "center" },
});
