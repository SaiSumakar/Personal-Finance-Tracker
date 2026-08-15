import settingsRepository from "@/database/repositories/settingsRepository";
import accountRepository from "@/database/repositories/accountRepository";

import {
  Settings,
  UpdateSettingsDTO,
} from "../types/settings";

import {
  SUPPORTED_CURRENCIES,
  Currency,
} from "@/constants/currencies";

import {
  SUPPORTED_DATE_FORMATS,
  DateFormat,
} from "@/constants/dateFormat";

class SettingsService {
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
