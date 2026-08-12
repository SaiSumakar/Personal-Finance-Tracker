// constants/settings.ts

import { Settings } from "../features/settings/types/settings";

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  defaultTransactionType: "expense",
  defaultAccountId: null,
  currency: "INR",
  dateFormat: "dd/mm/yyyy",
  confirmTransactionDelete: true,
  defaultBudgetCycle: "monthly",
  totalBudget: 0,
};