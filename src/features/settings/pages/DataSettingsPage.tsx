import { useState } from "react";
import {
  Platform,
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
import * as DocumentPicker from "expo-document-picker";

import { useSettingsStore } from "../stores/settingsStore";
import settingsService, { type BackupPreview, type ImportMode } from "../services/settingsService";
import { useAccountStore } from "@/features/accounts/stores/accountStore";
import { useCategoryStore } from "@/features/categories/stores/categoryStore";
import { useTransactionStore } from "@/features/transactions/stores/transactionStore";
import { useProfileStore } from "@/features/profile/stores/profileStore";

export default function DataBackupSettingsPage() {
  const {
    isExporting: isPreparingExport,
    lastExportedAt,
    exportBackup,
    importBackup,
  } = useSettingsStore();
  const [isSavingExport, setIsSavingExport] = useState(false);
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  const [isImporting, setIsImporting] = useState(false);
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

      // Create the file temporarily inside the app
      const file = new File(Paths.cache, fileName);

      // Write the backup JSON
      file.write(backup.json);

      // Check whether the native sharing dialog is available
      const sharingAvailable = await Sharing.isAvailableAsync();

      if (!sharingAvailable) {
        Alert.alert(
          "Export failed",
          "File sharing is not available on this device."
        );
        return;
      }

      // Open Android/iOS system share sheet
      await Sharing.shareAsync(file.uri, {
        mimeType: "application/json",
        dialogTitle: "Save Financial Data Backup",
        UTI: "public.json",
      });

      Alert.alert(
        "Export ready",
        "Choose Downloads or your preferred location in the save/share menu."
      );
    } catch (error) {
      console.error("Failed to export data:", error);

      Alert.alert(
        "Export failed",
        error instanceof Error
          ? error.message
          : "We couldn't export your data. Please try again."
      );
    } finally {
      setIsSavingExport(false);
    }
  };

const handlePickBackup = async () => {
  if (isImporting) return;

  try {
    const pickResult = await File.pickFileAsync({
      multipleFiles: false,
      mimeTypes: ["application/json", "text/json"],
    });

    console.log("Pick result:", pickResult);

    if (pickResult.canceled) {
      return;
    }

    // The actual File is inside .result
    const file = pickResult.result;

    console.log("Picked file URI:", file.uri);
    console.log("Exists:", file.exists);
    console.log("Name:", file.name);
    console.log("Size:", file.size);

    if (!file.exists) {
      throw new Error(
        "The selected backup file could not be accessed."
      );
    }

    const json = await file.text();

    if (!json.trim()) {
      throw new Error(
        "The selected backup file is empty."
      );
    }

    const backupPreview =
      await settingsService.previewBackup(json);

    setPreview(backupPreview);

  } catch (error) {
    console.error("Import error:", error);

    setPreview(null);

    Alert.alert(
      "Can't import this backup",
      error instanceof Error
        ? error.message
        : "Please choose a valid finance backup JSON file."
    );
  }
};

  const refreshAppState = async () => {
    await Promise.all([
      useAccountStore.getState().loadAccounts(),
      useCategoryStore.getState().loadCategories(),
      useTransactionStore.getState().loadTransactions(),
      useTransactionStore.getState().loadRecentTransactions(),
      useProfileStore.getState().loadProfile(),
    ]);
  };

  const confirmImport = (mode: ImportMode) => {
    if (!preview || isImporting) return;
    const isReplace = mode === "replace";
    Alert.alert(
      isReplace ? "Replace current data?" : "Merge backup data?",
      isReplace
        ? "This permanently removes your current app data and replaces it with this backup."
        : "Only non-conflicting data will be added. Existing data will not be overwritten.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isReplace ? "Replace data" : "Merge data",
          style: isReplace ? "destructive" : "default",
          onPress: async () => {
            setIsImporting(true);

            try {
              const imported = await importBackup(
                preview.backup,
                mode
              );

              if (imported) {
                await refreshAppState();
                setPreview(null);

                Alert.alert(
                  "Import complete",
                  "Your backup has been imported successfully."
                );
              } else {
                Alert.alert(
                  "Import failed",
                  useSettingsStore.getState().error ??
                    "Your current data was not changed."
                );
              }
            } catch (error) {
              console.error("Import failed:", error);

              Alert.alert(
                "Import failed",
                error instanceof Error
                  ? error.message
                  : "An unexpected error occurred while importing your backup."
              );
            } finally {
              setIsImporting(false);
            }
          },
        },
      ]
    );
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

      <View style={styles.importCard}>
        <Text style={styles.comingSoonTitle}>Import data</Text>
        <Text style={styles.comingSoonText}>
          Restore your financial data from a versioned JSON backup.
        </Text>
        <Pressable
          onPress={handlePickBackup}
          disabled={isImporting}
          style={({ pressed }) => [styles.importButton, pressed && !isImporting && styles.exportButtonPressed]}
        >
          <Text style={styles.exportButtonText}>Choose backup JSON</Text>
        </Pressable>
      </View>

      {preview && (
        <View style={styles.previewCard}>
          <Text style={styles.cardTitle}>
            {preview.hasOnlyStarterData ? "Import Backup" : "You already have data"}
          </Text>
          <Text style={styles.cardDescription}>
            {preview.hasOnlyStarterData
              ? "You currently only have starter data. Importing this backup will replace the current data."
              : "You already have data in this app. Choose how you want to import this backup."}
          </Text>
          <View style={styles.previewList}>
            <Text style={styles.dataItem}>Accounts: {preview.counts.accounts}</Text>
            <Text style={styles.dataItem}>Categories: {preview.counts.categories}</Text>
            <Text style={styles.dataItem}>Transactions: {preview.counts.transactions}</Text>
            <Text style={styles.dataItem}>Settings: {preview.counts.settings}</Text>
            {preview.exportedAt && <Text style={styles.dataItem}>Exported: {new Date(preview.exportedAt).toLocaleString()}</Text>}
            <Text style={styles.dataItem}>Backup version: {preview.backup.version}{preview.appVersion ? ` • App ${preview.appVersion}` : ""}</Text>
          </View>
          {!preview.hasOnlyStarterData && (
            <Text style={styles.replaceWarning}>
              Replacing removes all current app data and replaces it with this backup. It is recommended over merge.
            </Text>
          )}
          <Pressable disabled={isImporting} onPress={() => confirmImport("replace")} style={styles.replaceButton}>
            {isImporting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.exportButtonText}>{preview.hasOnlyStarterData ? "Replace current data" : "Replace complete data"}</Text>}
          </Pressable>
          {!preview.hasOnlyStarterData && (
            <Pressable disabled={isImporting} onPress={() => confirmImport("merge")} style={styles.mergeButton}>
              <Text style={styles.mergeButtonText}>Merge data</Text>
            </Pressable>
          )}
          <Pressable disabled={isImporting} onPress={() => setPreview(null)} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      )}
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

  importCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    marginBottom: 20,
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

  importButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  previewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },

  previewList: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 14,
    gap: 6,
    marginVertical: 16,
  },

  replaceWarning: {
    fontSize: 13,
    lineHeight: 19,
    color: "#8B3A00",
    marginBottom: 16,
  },

  replaceButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },

  mergeButton: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  mergeButtonText: { fontSize: 15, fontWeight: "700", color: "#374151" },
  cancelButton: { alignItems: "center", paddingTop: 16, paddingBottom: 2 },
  cancelButtonText: { fontSize: 15, fontWeight: "600", color: "#6B7280" },
});
