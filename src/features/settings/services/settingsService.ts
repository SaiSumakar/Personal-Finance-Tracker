import settingsRepository from "@/database/repositories/settingsRepository";
import accountRepository from "@/database/repositories/accountRepository";

import Constants from "expo-constants";
import type { SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "@/database/database";

import {
  Settings,
  UpdateSettingsDTO,
} from "../types/settings";

export type SettingsBackup = {
  json: string;
  exportedAt: string;
};

type BackupProfile = {
  id: number;
  preferred_name: string;
  picture_uri: string | null;
  created_at: string;
  updated_at: string;
};

type BackupSetting = { key: string; value: string | null };
type BackupAccount = {
  id: number; name: string; type: string; currency: string;
  opening_balance: number; current_balance: number; color: string | null;
  icon: string | null; is_archived: number; created_at: string; updated_at: string;
  deleted_at: string | null;
};
type BackupCategory = {
  id: number; name: string; type: "income" | "expense"; icon: string | null;
  color: string | null; parent_id: number | null; is_default: number;
  is_archived: number; created_at: string; updated_at: string; deleted_at: string | null;
};
type BackupTransaction = {
  id: number; from_account_id: number | null; to_account_id: number | null;
  category_id: number | null; type: "income" | "expense" | "transfer";
  amount: number; note: string | null; transaction_date: string;
  payment_method: string | null; location: string | null; created_at: string;
  updated_at: string; deleted_at: string | null;
};

export type ValidBackup = {
  format: "trace-export";
  version: 1;
  exported_at?: string;
  app_version?: string;
  data: {
    profile: BackupProfile | null;
    settings: BackupSetting[];
    accounts: BackupAccount[];
    categories: BackupCategory[];
    transactions: BackupTransaction[];
  };
};

export type BackupPreview = {
  backup: ValidBackup;
  exportedAt: string | null;
  appVersion: string | null;
  counts: { accounts: number; categories: number; transactions: number; settings: number; profile: number };
  hasOnlyStarterData: boolean;
};

export type ImportMode = "replace" | "merge";
type IdMappings = { accounts: Map<number, number>; categories: Map<number, number> };

import {
  SUPPORTED_CURRENCIES,
  Currency,
} from "@/constants/currencies";

import {
  SUPPORTED_DATE_FORMATS,
  DateFormat,
} from "@/constants/dateFormat";

class SettingsService {
  /** Parses the public export format and rejects unsupported or unsafe backups. */
  validateBackup(json: string): ValidBackup {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error("This file is not valid JSON.");
    }

    if (!isRecord(parsed) || parsed.format !== "trace-export") {
      throw new Error("This is not a Trace finance backup.");
    }
    if (parsed.version !== 1) {
      throw new Error(`Backup version ${String(parsed.version)} is not supported.`);
    }
    if (!isRecord(parsed.data)) {
      throw new Error("The backup does not contain data.");
    }

    const data = parsed.data;
    if (!Array.isArray(data.settings) || !Array.isArray(data.accounts) ||
        !Array.isArray(data.categories) || !Array.isArray(data.transactions) ||
        !isRecord(data.profile) || !data.settings.every(isRecord) || !data.accounts.every(isRecord) ||
        !data.categories.every(isRecord) || !data.transactions.every(isRecord)) {
      throw new Error("The backup is missing one or more required tables.");
    }

    const backup = parsed as unknown as ValidBackup;
    this.validateRecords(backup);
    return backup;
  }

  async previewBackup(json: string): Promise<BackupPreview> {
    const backup = this.validateBackup(json);
    const existing = await settingsRepository.getBackupData();
    return {
      backup,
      exportedAt: backup.exported_at ?? null,
      appVersion: backup.app_version ?? null,
      counts: {
        accounts: backup.data.accounts.length,
        categories: backup.data.categories.length,
        transactions: backup.data.transactions.length,
        settings: backup.data.settings.length,
        profile: backup.data.profile ? 1 : 0,
      },
      hasOnlyStarterData: this.analyzeExistingData(existing),
    };
  }

  async importBackup(backup: ValidBackup, mode: ImportMode): Promise<void> {
    // Revalidate at the mutation boundary; a preview is never trusted as validation.
    this.validateRecords(backup);
    const db = await getDatabase();
    await db.withExclusiveTransactionAsync(async (txn) => {
      if (mode === "replace") {
        await this.replaceAllData(txn, backup);
      } else {
        await this.mergeData(txn, backup);
      }
      await this.validateImportedData(txn);
    });
  }

  private analyzeExistingData(data: Awaited<ReturnType<typeof settingsRepository.getBackupData>>): boolean {
    const defaultCategoryNames = new Set([
      "expense:Food", "expense:Groceries", "expense:Transport", "expense:Fuel", "expense:Shopping",
      "expense:Bills", "expense:Entertainment", "expense:Healthcare", "expense:Education", "expense:Travel",
      "expense:Subscriptions", "expense:Others", "income:Salary", "income:Freelance", "income:Interest",
      "income:Gift", "income:Investment", "income:Others",
    ]);
    const onlyCash = data.accounts.length === 1 && data.accounts[0].name === "Cash" &&
      data.accounts[0].opening_balance === 0 && data.accounts[0].current_balance === 0;
    const onlyDefaultCategories = data.categories.length === defaultCategoryNames.size &&
      data.categories.every((category) => defaultCategoryNames.has(`${category.type}:${category.name}`));
    const blankProfile = !data.profile || (!data.profile.preferred_name && !data.profile.picture_uri);
    return data.transactions.length === 0 && onlyCash && onlyDefaultCategories && blankProfile;
  }

  private validateRecords(backup: ValidBackup): void {
    const { accounts, categories, transactions, settings, profile } = backup.data;
    const accountIds = new Set<number>();
    const categoryIds = new Set<number>();
    const requireId = (id: unknown, label: string, ids: Set<number>) => {
      if (!Number.isInteger(id) || (id as number) <= 0 || ids.has(id as number)) throw new Error(`Invalid or duplicate ${label} ID.`);
      ids.add(id as number);
    };
    accounts.forEach((account) => {
      requireId(account.id, "account", accountIds);
      if (!nonEmptyString(account.name) || !nonEmptyString(account.type) || !nonEmptyString(account.currency) ||
          !Number.isFinite(account.opening_balance) || !Number.isFinite(account.current_balance)) {
        throw new Error("An account has invalid required fields.");
      }
    });
    categories.forEach((category) => {
      requireId(category.id, "category", categoryIds);
      if (!nonEmptyString(category.name) || !["income", "expense"].includes(category.type)) {
        throw new Error("A category has invalid required fields.");
      }
    });
    categories.forEach((category) => {
      if (category.parent_id != null && !categoryIds.has(category.parent_id)) throw new Error("A category references a missing parent.");
    });
    const settingKeys = new Set<string>();
    settings.forEach((setting) => {
      if (!nonEmptyString(setting.key) || settingKeys.has(setting.key)) throw new Error("Settings contain an invalid or duplicate key.");
      settingKeys.add(setting.key);
    });
    if (!profile || !Number.isInteger(profile.id) || typeof profile.preferred_name !== "string") throw new Error("The profile is invalid.");
    const transactionIds = new Set<number>();
    transactions.forEach((transaction) => {
      requireId(transaction.id, "transaction", transactionIds);
      this.validateTransactionRecord(transaction, accountIds, categoryIds);
    });
  }

  private validateTransactionRecord(transaction: BackupTransaction, accountIds: Set<number>, categoryIds: Set<number>): void {
    if (!Number.isInteger(transaction.id) || transaction.id <= 0 || !Number.isFinite(transaction.amount) ||
        transaction.amount < 0 || !nonEmptyString(transaction.transaction_date) ||
        !["income", "expense", "transfer"].includes(transaction.type)) throw new Error("A transaction has invalid required fields.");
    const hasAccount = (id: number | null) => id != null && accountIds.has(id);
    if ((transaction.from_account_id != null && !hasAccount(transaction.from_account_id)) ||
        (transaction.to_account_id != null && !hasAccount(transaction.to_account_id)) ||
        (transaction.category_id != null && !categoryIds.has(transaction.category_id))) throw new Error("A transaction references missing data.");
    if ((transaction.type === "income" && (transaction.from_account_id != null || !hasAccount(transaction.to_account_id))) ||
        (transaction.type === "expense" && (!hasAccount(transaction.from_account_id) || transaction.to_account_id != null)) ||
        (transaction.type === "transfer" && (!hasAccount(transaction.from_account_id) || !hasAccount(transaction.to_account_id) || transaction.from_account_id === transaction.to_account_id))) {
      throw new Error("A transaction has invalid account relationships.");
    }
  }

  private async replaceAllData(db: SQLiteDatabase, backup: ValidBackup): Promise<void> {
    await db.execAsync("DELETE FROM transactions; DELETE FROM categories; DELETE FROM accounts; DELETE FROM settings; DELETE FROM profile;");
    await this.importInDependencyOrder(db, backup, false);
  }

  private async mergeData(db: SQLiteDatabase, backup: ValidBackup): Promise<void> {
    // Merging only adds records with unambiguous natural keys. Existing values are never overwritten.
    await this.importInDependencyOrder(db, backup, true);
  }

  private async importInDependencyOrder(db: SQLiteDatabase, backup: ValidBackup, merge: boolean): Promise<void> {
    const mappings = await this.buildIdMappings(db, backup, merge);
    const existingCategoryIds = new Set(mappings.categories.keys());
    const { profile, settings, accounts, categories, transactions } = backup.data;
    if (!merge && profile) {
      await db.runAsync("INSERT INTO profile (id, preferred_name, picture_uri, created_at, updated_at) VALUES (1, ?, ?, ?, ?)", [profile.preferred_name, profile.picture_uri, profile.created_at, profile.updated_at]);
    }
    for (const account of accounts) {
      if (mappings.accounts.has(account.id)) continue;
      const result = await db.runAsync("INSERT INTO accounts (name, type, currency, opening_balance, current_balance, color, icon, is_archived, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [account.name, account.type, account.currency, account.opening_balance, account.current_balance, account.color, account.icon, account.is_archived, account.created_at, account.updated_at, account.deleted_at]);
      mappings.accounts.set(account.id, Number(result.lastInsertRowId));
    }
    for (const category of categories) {
      if (mappings.categories.has(category.id)) continue;
      const result = await db.runAsync("INSERT INTO categories (name, type, icon, color, parent_id, is_default, is_archived, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?)", [category.name, category.type, category.icon, category.color, category.is_default, category.is_archived, category.created_at, category.updated_at, category.deleted_at]);
      mappings.categories.set(category.id, Number(result.lastInsertRowId));
    }
    for (const category of categories) {
      if (category.parent_id != null && !existingCategoryIds.has(category.id)) {
        await db.runAsync("UPDATE categories SET parent_id = ? WHERE id = ?", [mappings.categories.get(category.parent_id)!, mappings.categories.get(category.id)!]);
      }
    }
    for (const setting of settings) {
      // Settings are not foreign-key constrained, but defaultAccountId is a reference.
      const value = setting.key === "defaultAccountId" && setting.value
        ? String(mappings.accounts.get(Number(setting.value)) ?? "")
        : setting.value;
      if (merge) await db.runAsync("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", [setting.key, value]);
      else await db.runAsync("INSERT INTO settings (key, value) VALUES (?, ?)", [setting.key, value]);
    }
    for (const transaction of transactions) {
      if (merge && await this.transactionAlreadyExists(db, transaction, mappings)) continue;
      await db.runAsync("INSERT INTO transactions (from_account_id, to_account_id, category_id, type, amount, note, transaction_date, payment_method, location, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
        transaction.from_account_id == null ? null : mappings.accounts.get(transaction.from_account_id)!,
        transaction.to_account_id == null ? null : mappings.accounts.get(transaction.to_account_id)!,
        transaction.category_id == null ? null : mappings.categories.get(transaction.category_id)!,
        transaction.type, transaction.amount, transaction.note, transaction.transaction_date, transaction.payment_method, transaction.location, transaction.created_at, transaction.updated_at, transaction.deleted_at,
      ]);
    }
  }

  private async buildIdMappings(db: SQLiteDatabase, backup: ValidBackup, merge: boolean): Promise<IdMappings> {
    const mappings: IdMappings = { accounts: new Map(), categories: new Map() };
    if (!merge) return mappings;
    for (const account of backup.data.accounts) {
      const existing = await db.getFirstAsync<{ id: number }>("SELECT id FROM accounts WHERE name = ?", [account.name]);
      if (existing) mappings.accounts.set(account.id, existing.id);
    }
    for (const category of backup.data.categories) {
      const existing = await db.getFirstAsync<{ id: number }>("SELECT id FROM categories WHERE name = ? AND type = ?", [category.name, category.type]);
      if (existing) mappings.categories.set(category.id, existing.id);
    }
    return mappings;
  }

  private async transactionAlreadyExists(db: SQLiteDatabase, transaction: BackupTransaction, mappings: IdMappings): Promise<boolean> {
    const row = await db.getFirstAsync<{ id: number }>("SELECT id FROM transactions WHERE type = ? AND amount = ? AND transaction_date = ? AND IFNULL(note, '') = IFNULL(?, '') AND from_account_id IS ? AND to_account_id IS ? AND category_id IS ? LIMIT 1", [transaction.type, transaction.amount, transaction.transaction_date, transaction.note, transaction.from_account_id == null ? null : mappings.accounts.get(transaction.from_account_id)!, transaction.to_account_id == null ? null : mappings.accounts.get(transaction.to_account_id)!, transaction.category_id == null ? null : mappings.categories.get(transaction.category_id)!]);
    return Boolean(row);
  }

  private async validateImportedData(db: SQLiteDatabase): Promise<void> {
    const violations = await db.getAllAsync("PRAGMA foreign_key_check");
    if (violations.length) throw new Error("Imported data contains invalid relationships.");
    const invalidTransactions = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM transactions WHERE (type = 'income' AND (from_account_id IS NOT NULL OR to_account_id IS NULL)) OR (type = 'expense' AND (from_account_id IS NULL OR to_account_id IS NOT NULL)) OR (type = 'transfer' AND (from_account_id IS NULL OR to_account_id IS NULL OR from_account_id = to_account_id))");
    if ((invalidTransactions?.count ?? 0) > 0) throw new Error("Imported data contains invalid transactions.");
  }
  async exportBackup() {
    try {
      const data = await settingsRepository.getBackupData();
      const exportedAt = new Date().toISOString();

      return {
        success: true as const,
        data: {
          json: JSON.stringify(
            {
              format: "trace-export",
              version: 1,
              exported_at: exportedAt,
              app_version: Constants.expoConfig?.version ?? "0.0.0",
              data,
            },
            null,
            2
          ),
          exportedAt,
        } satisfies SettingsBackup,
      };
    } catch (error) {
      return {
        success: false as const,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to export data",
        },
      };
    }
  }

  async getSettings() {
    try {
      const settings =
        await settingsRepository.getSettings();

      return {
        success: true as const,
        data: settings,
      };
    } catch (error) {
      return {
        success: false as const,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to load settings",
        },
      };
    }
  }

  async updateSettings(dto: UpdateSettingsDTO) {
    try {
      // Validate theme
      if (
        dto.theme !== undefined &&
        !["light", "dark", "system"].includes(dto.theme)
      ) {
        return {
          success: false as const,
          error: {
            message: "Invalid theme",
          },
        };
      }

      // Validate transaction type
      if (
        dto.defaultTransactionType !== undefined &&
        !["expense", "income"].includes(
          dto.defaultTransactionType
        )
      ) {
        return {
          success: false as const,
          error: {
            message: "Invalid default transaction type",
          },
        };
      }

      // Validate currency
      if (
        dto.currency !== undefined &&
        !SUPPORTED_CURRENCIES.includes(dto.currency as Currency)
      ) {
        return {
          success: false as const,
          error: {
            message: "Unsupported currency",
          },
        };
      }

      // Validate date format
      if (
        dto.dateFormat !== undefined &&
        !SUPPORTED_DATE_FORMATS.includes(dto.dateFormat)
      ) {
        return {
          success: false as const,
          error: {
            message: "Unsupported date format",
          },
        };
      }

      // Validate default account
      if (
        dto.defaultAccountId !== undefined &&
        dto.defaultAccountId !== null
      ) {
        const account =
          await accountRepository.getById(
            dto.defaultAccountId
          );

        if (!account) {
          return {
            success: false as const,
            error: {
              message: "Default account does not exist",
            },
          };
        }
      }

      // Validate budget cycle
      if (
        dto.budgetDate !== undefined &&
        Number.isNaN(new Date(dto.budgetDate).getTime())
      ) {
        return {
          success: false as const,
          error: {
            message: "Invalid budget date",
          },
        };
      }

      if (
        dto.defaultBudgetCycle !== undefined &&
        !["monthly", "quarterly", "yearly"].includes(
          dto.defaultBudgetCycle
        )
      ) {
        return {
          success: false as const,
          error: {
            message: "Invalid default budget cycle",
          },
        };
      }

      // Validate budget
      if (
        dto.totalBudget !== undefined &&
        (typeof dto.totalBudget !== "number" ||
          dto.totalBudget < 0)
      ) {
        return {
          success: false as const,
          error: {
            message: "Total budget must be a non-negative number",
          },
        };
      }

      // Update settings in SQLite
      await settingsRepository.updateSettings(dto);

      // Return updated settings
      const settings =
        await settingsRepository.getSettings();

      return {
        success: true as const,
        data: settings,
      };
    } catch (error) {
      return {
        success: false as const,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to update settings",
        },
      };
    }
  }
}

export default new SettingsService();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
