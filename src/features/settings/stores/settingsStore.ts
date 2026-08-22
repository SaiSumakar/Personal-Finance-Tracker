import { create } from "zustand";

import settingsService from "../services/settingsService";
import type { SettingsBackup } from "../services/settingsService";
import {
  Settings,
  UpdateSettingsDTO,
} from "../types/settings";

import { DEFAULT_SETTINGS } from "@/constants/settings";

interface SettingsStore {
  settings: Settings;
  loading: boolean;
  error: string | null;
  isExporting: boolean;
  lastExportedAt: string | null;

  exportBackup: () => Promise<SettingsBackup | null>;
  loadSettings: () => Promise<void>;
  updateSettings: (
    dto: UpdateSettingsDTO
  ) => Promise<boolean>;
}

export const useSettingsStore =
  create<SettingsStore>((set) => ({
    settings: DEFAULT_SETTINGS,
    loading: false,
    error: null,
    isExporting: false,
    lastExportedAt: null,

    async exportBackup() {
      set({
        isExporting: true,
        error: null,
      });

      const result = await settingsService.exportBackup();

      if (!result.success) {
        set({
          isExporting: false,
          error: result.error.message,
        });

        return null;
      }

      set({
        isExporting: false,
        lastExportedAt: result.data.exportedAt,
        error: null,
      });

      return result.data;
    },

    async loadSettings() {
      set({
        loading: true,
        error: null,
      });

      const result =
        await settingsService.getSettings();

      if (!result.success) {
        set({
          loading: false,
          error: result.error.message,
        });

        return;
      }

      set({
        loading: false,
        settings: result.data,
        error: null,
      });
    },

    async updateSettings(dto) {
      const result =
        await settingsService.updateSettings(dto);

      if (!result.success) {
        set({
          error: result.error.message,
        });

        return false;
      }

      set({
        settings: result.data,
        error: null,
      });

      return true;
    },
  }));
