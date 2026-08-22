import { BaseRepository } from "./baseRepository";

import {
  Settings,
  UpdateSettingsDTO,
} from "@/features/settings/types/settings";

export type BackupData = {
  profile: Profile | null;
  settings: Setting[];
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
};

type Profile = {
  id: number;
  preferred_name: string;
  picture_uri: string | null;
  created_at: string;
  updated_at: string;
};

type Setting = {
  key: string;
  value: string | null;
};

type Account = {
  id: number;
  name: string;
  type: string;
  currency: string;
  opening_balance: number;
  current_balance: number;
  color: string | null;
  icon: string | null;
  is_archived: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type Category = {
  id: number;
  name: string;
  type: "income" | "expense";
  icon: string | null;
  color: string | null;
  parent_id: number | null;
  is_default: number;
  is_archived: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type Transaction = {
  id: number;
  from_account_id: number | null;
  to_account_id: number | null;
  category_id: number | null;
  type: "income" | "expense" | "transfer";
  amount: number;
  note: string | null;
  transaction_date: string;
  payment_method: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

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

  async getBackupData(): Promise<BackupData> {
    const db = await this.db();

    try {
      const [
        profile,
        settings,
        accounts,
        categories,
        transactions,
      ] = await Promise.all([
        db.getFirstAsync<Profile>(
          "SELECT * FROM profile ORDER BY id ASC"
        ),
        db.getAllAsync<Setting>(
          "SELECT * FROM settings ORDER BY key ASC"
        ),
        db.getAllAsync<Account>(
          "SELECT * FROM accounts ORDER BY id ASC"
        ),
        db.getAllAsync<Category>(
          "SELECT * FROM categories ORDER BY id ASC"
        ),
        db.getAllAsync<Transaction>(
          "SELECT * FROM transactions ORDER BY id ASC"
        ),
      ]);

      return {
        profile,
        settings,
        accounts,
        categories,
        transactions,
      };
    } catch (error) {
      this.handleError("Get Backup Data", error);
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
