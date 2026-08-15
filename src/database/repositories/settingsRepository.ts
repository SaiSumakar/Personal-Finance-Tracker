import { BaseRepository } from "./baseRepository";

import {
  Settings,
  UpdateSettingsDTO,
} from "@/features/settings/types/settings";

class SettingsRepository extends BaseRepository {
  /**
   * Get all application settings.
   *
   * SQLite stores settings as:
   * key | value
   *
   * This method converts them into the typed Settings object.
   */
  async getSettings(): Promise<Settings> {
    const db = await this.db();

    try {
      const rows = await db.getAllAsync<{
        key: string;
        value: string;
      }>(
        `
        SELECT key, value
        FROM settings
        `
      );

      const values = new Map(
        rows.map((row) => [row.key, row.value])
      );

      return {
        theme: values.get("theme") as Settings["theme"],

        defaultTransactionType:
          values.get(
            "defaultTransactionType"
          ) as Settings["defaultTransactionType"],

        defaultAccountId: this.parseNullableNumber(
          values.get("defaultAccountId")
        ),

        currency:
          values.get("currency") as Settings["currency"],

        dateFormat:
          values.get("dateFormat") as Settings["dateFormat"],

        confirmTransactionDelete:
          this.parseBoolean(
            values.get("confirmTransactionDelete")
          ),

        budgetDate:
          values.get("budgetDate") ??
          new Date().toISOString(),

        defaultBudgetCycle:
          values.get(
            "defaultBudgetCycle"
          ) as Settings["defaultBudgetCycle"],

        totalBudget:
          this.parseNumber(
            values.get("totalBudget")
          ),
      };
    } catch (error) {
      this.handleError("Get Settings", error);
    }
  }

  /**
   * Update only the settings provided in the DTO.
   */
  async updateSettings(
    dto: UpdateSettingsDTO
  ): Promise<void> {
    await this.transaction(async (db) => {
      for (const [key, value] of Object.entries(dto)) {
        if (value === undefined) {
          continue;
        }

        const serializedValue =
          this.serializeValue(value);

        await db.runAsync(
          `
          INSERT INTO settings (key, value)
          VALUES (?, ?)
          ON CONFLICT(key)
          DO UPDATE SET value = excluded.value
          `,
          key,
          serializedValue
        );
      }
    });
  }

  /**
   * Get a single setting.
   */
  async getSetting(
    key: keyof Settings
  ): Promise<string | null> {
    const db = await this.db();

    try {
      const row = await db.getFirstAsync<{
        value: string;
      }>(
        `
        SELECT value
        FROM settings
        WHERE key = ?
        `,
        key
      );

      return row?.value ?? null;
    } catch (error) {
      this.handleError(
        `Get Setting: ${key}`,
        error
      );
    }
  }

  /**
   * Update a single setting.
   */
  async setSetting(
    key: keyof Settings,
    value: Settings[typeof key]
  ): Promise<void> {
    const db = await this.db();

    try {
      await db.runAsync(
        `
        INSERT INTO settings (key, value)
        VALUES (?, ?)
        ON CONFLICT(key)
        DO UPDATE SET value = excluded.value
        `,
        key,
        this.serializeValue(value)
      );
    } catch (error) {
      this.handleError(
        `Set Setting: ${key}`,
        error
      );
    }
  }

  private serializeValue(value: unknown): string {
    if (typeof value === "boolean") {
      return value ? "1" : "0";
    }

    if (value === null) {
      return "";
    }

    return String(value);
  }

  private parseBoolean(
    value: string | undefined
  ): boolean {
    return value === "1";
  }

  private parseNumber(
    value: string | undefined
  ): number {
    const parsed = Number(value);

    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private parseNullableNumber(
    value: string | undefined
  ): number | null {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return null;
    }

    const parsed = Number(value);

    return Number.isNaN(parsed) ? null : parsed;
  }
}

export default new SettingsRepository();
