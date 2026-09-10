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
