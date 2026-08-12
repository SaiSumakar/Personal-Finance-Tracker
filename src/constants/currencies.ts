export const SUPPORTED_CURRENCIES = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "JPY",
] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];