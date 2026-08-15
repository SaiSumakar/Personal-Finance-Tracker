import { BaseRepository } from "./baseRepository";

import type {
  Profile,
  ProfileStats,
  UpdateProfileDTO,
} from "@/features/profile/types/profile";

class ProfileRepository extends BaseRepository {
  async getProfile(): Promise<Profile> {
    const db = await this.db();

    try {
      const profile = await db.getFirstAsync<Profile>(`
        SELECT id, preferred_name, picture_uri, created_at, updated_at
        FROM profile
        WHERE id = 1
      `);

      if (!profile) throw new Error("Profile has not been initialized");

      return profile;
    } catch (error) {
      this.handleError("Get profile", error);
    }
  }

  async updateProfile(dto: UpdateProfileDTO): Promise<void> {
    const fields: string[] = [];
    const values: (string | null)[] = [];

    if (dto.preferredName !== undefined) {
      fields.push("preferred_name = ?");
      values.push(dto.preferredName);
    }

    if (dto.pictureUri !== undefined) {
      fields.push("picture_uri = ?");
      values.push(dto.pictureUri);
    }

    if (!fields.length) return;

    const db = await this.db();

    try {
      await db.runAsync(
        `UPDATE profile SET ${fields.join(", ")}, updated_at = datetime('now') WHERE id = 1`,
        values
      );
    } catch (error) {
      this.handleError("Update profile", error);
    }
  }

  async getStats(): Promise<ProfileStats> {
    const db = await this.db();

    try {
      const stats = await db.getFirstAsync<{
        transactions: number;
        categoriesUsed: number;
        totalIncome: number;
        totalExpenses: number;
      }>(`
        SELECT
          COUNT(t.id) AS transactions,
          COUNT(DISTINCT t.category_id) AS categoriesUsed,
          COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount END), 0) AS totalIncome,
          COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount END), 0) AS totalExpenses
        FROM transactions t
        WHERE t.deleted_at IS NULL
      `);

      const profile = await this.getProfile();
      const totalIncome = stats?.totalIncome ?? 0;
      const totalExpenses = stats?.totalExpenses ?? 0;

      return {
        trackingSince: profile.created_at,
        transactions: stats?.transactions ?? 0,
        categoriesUsed: stats?.categoriesUsed ?? 0,
        totalIncome,
        totalExpenses,
        currentSavings: totalIncome - totalExpenses,
      };
    } catch (error) {
      this.handleError("Get profile stats", error);
    }
  }
}

export default new ProfileRepository();
