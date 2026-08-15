// constants/settings.ts

import { Settings } from "../features/settings/types/settings";

export const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  defaultTransactionType: "expense",
  defaultAccountId: null,
  currency: "INR",
  dateFormat: "dd/mm/yyyy",
  confirmTransactionDelete: true,
  budgetDate: new Date().toISOString(),
  defaultBudgetCycle: "monthly",
  totalBudget: 0,
};
