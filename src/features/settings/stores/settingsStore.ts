import { create } from "zustand";

import settingsService from "../services/settingsService";
import {
  Settings,
  UpdateSettingsDTO,
} from "../types/settings";

interface SettingsStore {
  settings: Settings | null;
  loading: boolean;
  error: string | null;

  loadSettings: () => Promise<void>;
  updateSettings: (dto: UpdateSettingsDTO) => Promise<boolean>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  loading: false,
  error: null,

  async loadSettings() {
    set({
      loading: true,
      error: null,
    });

    const result = await settingsService.getSettings();

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
    const result = await settingsService.updateSettings(dto);

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