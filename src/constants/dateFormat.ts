export const SUPPORTED_DATE_FORMATS = [
  "dd/mm/yyyy",
  "mm/dd/yyyy",
] as const;

export type DateFormat = (typeof SUPPORTED_DATE_FORMATS)[number];