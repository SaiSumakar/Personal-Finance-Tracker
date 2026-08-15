import * as FileSystem from "expo-file-system/legacy";

import profileRepository from "@/database/repositories/profileRepository";

import type { ProfileData } from "../types/profile";

const profilePictureDirectory = "profile-pictures/";

class ProfileService {
  async getProfileData(): Promise<ProfileData> {
    const [profile, stats] = await Promise.all([
      profileRepository.getProfile(),
      profileRepository.getStats(),
    ]);

    return { profile, stats };
  }

  async updatePreferredName(preferredName: string): Promise<ProfileData> {
    const trimmedName = preferredName.trim();

    if (trimmedName.length > 50) {
      throw new Error("Preferred name must be 50 characters or fewer");
    }

    await profileRepository.updateProfile({ preferredName: trimmedName });
    return this.getProfileData();
  }

  async replaceProfilePicture(sourceUri: string): Promise<ProfileData> {
    const documentDirectory = FileSystem.documentDirectory;
    if (!documentDirectory) throw new Error("Profile picture storage is unavailable");

    const destinationDirectory = `${documentDirectory}${profilePictureDirectory}`;
    await FileSystem.makeDirectoryAsync(destinationDirectory, { intermediates: true });

    const newPictureUri = `${destinationDirectory}profile-${Date.now()}.${this.getFileExtension(sourceUri)}`;
    await FileSystem.copyAsync({ from: sourceUri, to: newPictureUri });

    const currentProfile = await profileRepository.getProfile();

    try {
      await profileRepository.updateProfile({ pictureUri: newPictureUri });
    } catch (error) {
      await this.deleteManagedProfilePicture(newPictureUri);
      throw error;
    }

    await this.deleteManagedProfilePicture(currentProfile.picture_uri);
    return this.getProfileData();
  }

  private getFileExtension(uri: string): string {
    const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
    return match?.[1]?.toLowerCase() ?? "jpg";
  }

  private async deleteManagedProfilePicture(uri: string | null): Promise<void> {
    if (!uri || !FileSystem.documentDirectory) return;

    const managedDirectory = `${FileSystem.documentDirectory}${profilePictureDirectory}`;
    if (!uri.startsWith(managedDirectory)) return;

    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (error) {
      console.warn("Failed to remove previous profile picture", error);
    }
  }
}

export default new ProfileService();
