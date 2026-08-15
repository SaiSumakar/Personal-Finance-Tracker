import { create } from "zustand";

import profileService from "../services/profileService";
import type { ProfileData } from "../types/profile";

interface ProfileStore {
  data: ProfileData | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  updatePreferredName: (preferredName: string) => Promise<boolean>;
  replaceProfilePicture: (sourceUri: string) => Promise<boolean>;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  data: null,
  isLoading: false,
  isSaving: false,
  error: null,

  async loadProfile() {
    set({ isLoading: true, error: null });
    try {
      const data = await profileService.getProfileData();
      set({ data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load profile",
      });
    }
  },

  async updatePreferredName(preferredName) {
    set({ isSaving: true, error: null });
    try {
      const data = await profileService.updatePreferredName(preferredName);
      set({ data, isSaving: false });
      return true;
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : "Failed to save preferred name",
      });
      return false;
    }
  },

  async replaceProfilePicture(sourceUri) {
    set({ isSaving: true, error: null });
    try {
      const data = await profileService.replaceProfilePicture(sourceUri);
      set({ data, isSaving: false });
      return true;
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : "Failed to save profile picture",
      });
      return false;
    }
  },
}));
