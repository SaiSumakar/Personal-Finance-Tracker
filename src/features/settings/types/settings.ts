import { Currency } from "@/constants/currencies";
import { DateFormat } from "@/constants/dateFormat";

export interface Settings {
  // Appearance
  theme: "light" | "dark" | "system",
  
  // Transaction preferences
  defaultTransactionType: "expense" | "income",
  defaultAccountId: number | null,
  currency: Currency,
  dateFormat: DateFormat,
  confirmTransactionDelete: boolean,

  // budget
  defaultBudgetCycle: "monthly" | "quarterly" | "yearly",
  totalBudget: number,
}

export interface UpdateSettingsDTO {
  // Appearance
  theme?: "light" | "dark" | "system";

  // Transaction preferences
  defaultTransactionType?: "expense" | "income";
  defaultAccountId?: number | null;
  currency?: Currency;
  dateFormat?: DateFormat;
  confirmTransactionDelete?: boolean;

  // Budget
  defaultBudgetCycle?: "monthly" | "quarterly" | "yearly";
  totalBudget?: number;
}