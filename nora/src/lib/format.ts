import { Locale } from "./types";

export function formatOMR(amount: number, locale: Locale = "en"): string {
  const value = amount.toFixed(3);
  return locale === "ar" ? `${value} ر.ع.` : `OMR ${value}`;
}
