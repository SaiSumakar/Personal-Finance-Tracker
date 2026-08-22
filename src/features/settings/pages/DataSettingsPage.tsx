import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { useSettingsStore } from "../stores/settingsStore";

export default function DataBackupSettingsPage() {
  const {
    isExporting: isPreparingExport,
    lastExportedAt,
    exportBackup,
  } = useSettingsStore();
  const [isSavingExport, setIsSavingExport] = useState(false);
  const isExporting = isPreparingExport || isSavingExport;

  const handleExportJson = async () => {
    if (isExporting) return;

    try {
      setIsSavingExport(true);

      const backup = await exportBackup();

      if (!backup) {
        Alert.alert(
          "Export failed",
          "We couldn't export your data. Please try again."
        );
        return;
      }

      const date = new Date(backup.exportedAt)
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .replace("Z", "");

      const fileName = `finance-data-${date}.json`;

      // Create the file inside the app's document directory
      const file = new File(Paths.document, fileName);

      // Write JSON data to the file
      file.write(backup.json);

      const sharingAvailable = await Sharing.isAvailableAsync();

      if (sharingAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/json",
          dialogTitle: "Export Financial Data",
          UTI: "public.json",
        });
      } else {
        Alert.alert(
          "Export complete",
          `Your JSON export has been created successfully.\n\n${file.uri}`
        );
      }

    } catch (error) {
      console.error("Failed to export data:", error);

      Alert.alert(
        "Export failed",
        "We couldn't export your data. Please try again."
      );
    } finally {
      setIsSavingExport(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>

        <Text style={styles.description}>
          Export, import and manage your financial data.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>EXPORT DATA</Text>

      <View style={styles.exportCard}>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Export as JSON</Text>

          <Text style={styles.cardDescription}>
            Create a complete copy of your financial data in a
            single JSON file.
          </Text>
        </View>

        <Pressable
          onPress={handleExportJson}
          disabled={isExporting}
          style={({ pressed }) => [
            styles.exportButton,
            isExporting && styles.exportButtonDisabled,
            pressed &&
              !isExporting &&
              styles.exportButtonPressed,
          ]}
        >
          {isExporting ? (
            <>
              <ActivityIndicator color="#FFFFFF" />

              <Text style={styles.exportButtonText}>
                Exporting...
              </Text>
            </>
          ) : (
            <Text style={styles.exportButtonText}>
              Export JSON
            </Text>
          )}
        </Pressable>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          About your export
        </Text>

        <Text style={styles.infoText}>
          Your export contains all of your profile, settings,
          accounts, categories and transactions.
        </Text>

        <Text style={styles.infoText}>
          The JSON file preserves your data structure and can be
          used for future imports and backups.
        </Text>
      </View>

      {lastExportedAt && (
        <Text style={styles.lastExport}>
          Last exported{" "}
          {new Date(lastExportedAt).toLocaleString()}
        </Text>
      )}

      <Text style={styles.sectionLabel}>IMPORT</Text>

      <View style={styles.comingSoonCard}>
        <Text style={styles.comingSoonTitle}>
          Import data
        </Text>

        <Text style={styles.comingSoonText}>
          Restore or import your financial data from a JSON file.
          Coming soon.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 32,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#8A8A8A",
    marginBottom: 10,
  },

  exportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  iconText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4F46E5",
  },

  cardContent: {
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 6,
  },

  cardDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
  },

  includedSection: {
    backgroundColor: "#F8F8F8",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },

  includedTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555555",
    marginBottom: 10,
  },

  dataList: {
    gap: 6,
  },

  dataItem: {
    fontSize: 14,
    color: "#555555",
  },

  exportButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  exportButtonDisabled: {
    opacity: 0.6,
  },

  exportButtonPressed: {
    opacity: 0.8,
  },

  exportButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    marginBottom: 28,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 10,
  },

  infoText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
    marginBottom: 8,
  },

  lastExport: {
    fontSize: 13,
    color: "#8A8A8A",
    marginTop: -10,
    marginBottom: 28,
    textAlign: "center",
  },

  comingSoonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    opacity: 0.7,
  },

  comingSoonTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 6,
  },

  comingSoonText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
  },
});
