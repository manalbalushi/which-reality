import { StyleDef, Recipient } from "@/lib/types";

export const styles: StyleDef[] = [
  { id: "feminine", name: { en: "Feminine", ar: "أنثوي" } },
  { id: "minimal", name: { en: "Minimal", ar: "بسيط" } },
  { id: "luxury", name: { en: "Luxury", ar: "فاخر" } },
  { id: "wellness", name: { en: "Wellness", ar: "العافية" } },
  { id: "coffee", name: { en: "Coffee Lover", ar: "محب القهوة" } },
  { id: "omani", name: { en: "Omani", ar: "عُماني" } },
  { id: "cute", name: { en: "Cute", ar: "لطيف" } },
  { id: "executive", name: { en: "Executive", ar: "تنفيذي" } },
];

export const recipients: Recipient[] = [
  { id: "friend", name: { en: "Friend", ar: "صديقة" } },
  { id: "mother", name: { en: "Mother", ar: "أم" } },
  { id: "sister", name: { en: "Sister", ar: "أخت" } },
  { id: "wife", name: { en: "Wife", ar: "زوجة" } },
  { id: "husband", name: { en: "Husband", ar: "زوج" } },
  { id: "colleague", name: { en: "Colleague", ar: "زميل" } },
  { id: "client", name: { en: "Client", ar: "عميل" } },
  { id: "other", name: { en: "Other", ar: "آخر" } },
];

export const budgetTiers = [20, 30, 50, 75, 100];

/** Quick-pick quantities for bulk/giveaway orders (e.g. kids' party favors). */
export const quantityTiers = [1, 12, 24, 50, 100];

/** Total-budget quick-picks shown once a bulk quantity (>1) is selected. */
export const bulkBudgetTiers = [60, 100, 150, 200];

export const builderOccasionIds = [
  "birthday",
  "wedding",
  "bride-to-be",
  "new-baby",
  "thank-you",
  "congratulations",
  "eid",
  "ramadan",
  "just-because",
  "corporate",
];
