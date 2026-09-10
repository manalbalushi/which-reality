import { StyleDef, Recipient } from "@/lib/types";

export const styles: StyleDef[] = [
  { id: "cute", name: { en: "Cute", ar: "لطيف" } },
  { id: "elegant", name: { en: "Elegant", ar: "أنيق" } },
  { id: "luxury", name: { en: "Luxury", ar: "فاخر" } },
  { id: "minimal", name: { en: "Minimal", ar: "بسيط" } },
  { id: "feminine", name: { en: "Feminine", ar: "أنثوي" } },
  { id: "fun", name: { en: "Fun", ar: "ممتع" } },
  { id: "traditional", name: { en: "Traditional", ar: "تقليدي" } },
  { id: "omani", name: { en: "Omani", ar: "عُماني" } },
  { id: "wellness", name: { en: "Wellness", ar: "العافية" } },
  { id: "coffee", name: { en: "Coffee Lover", ar: "محب القهوة" } },
  { id: "executive", name: { en: "Executive", ar: "تنفيذي" } },
];

export const recipients: Recipient[] = [
  { id: "friend", name: { en: "Friend", ar: "صديقة" } },
  { id: "mother", name: { en: "Mother", ar: "أم" } },
  { id: "sister", name: { en: "Sister", ar: "أخت" } },
  { id: "wife", name: { en: "Wife", ar: "زوجة" } },
  { id: "husband", name: { en: "Husband", ar: "زوج" } },
  { id: "child", name: { en: "Child", ar: "طفل" } },
  { id: "teacher", name: { en: "Teacher", ar: "معلمة" } },
  { id: "colleague", name: { en: "Colleague", ar: "زميل" } },
  { id: "client", name: { en: "Client", ar: "عميل" } },
  { id: "other", name: { en: "Other", ar: "آخر" } },
];

export const budgetTiers = [10, 20, 30, 50, 75, 100];

/** Quick-pick quantities for bulk/giveaway orders (e.g. kids' party favors). */
export const quantityTiers = [12, 20, 30, 50, 100];

/** Total-budget quick-picks shown once a bulk quantity (>1) is selected. */
export const bulkBudgetTiers = [50, 90, 100, 150, 200, 500];

export const builderOccasionIds = [
  "birthday",
  "graduation",
  "qaranqashouh",
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

/** Occasions offered on the Plan Your Giveaways / bulk-distribution flow. */
export const giveawayOccasionIds = [
  "birthday",
  "wedding",
  "new-baby",
  "graduation",
  "qaranqashouh",
  "ramadan",
  "eid",
  "school-event",
  "corporate",
  "majlis",
];

export const recipientGroups: { id: string; name: { en: string; ar: string } }[] = [
  { id: "girls", name: { en: "Girls", ar: "بنات" } },
  { id: "boys", name: { en: "Boys", ar: "أولاد" } },
  { id: "adults", name: { en: "Adults", ar: "بالغين" } },
  { id: "mixed", name: { en: "Mixed", ar: "مختلط" } },
];

export const ageGroups: { id: "3-5" | "6-8" | "9-12" | "teen" | "adult"; name: { en: string; ar: string } }[] = [
  { id: "3-5", name: { en: "3–5 years", ar: "٣–٥ سنوات" } },
  { id: "6-8", name: { en: "6–8 years", ar: "٦–٨ سنوات" } },
  { id: "9-12", name: { en: "9–12 years", ar: "٩–١٢ سنة" } },
  { id: "teen", name: { en: "Teen", ar: "مراهق" } },
  { id: "adult", name: { en: "Adult", ar: "بالغ" } },
];

export const qaranqashouhThemes: { id: string; name: { en: string; ar: string } }[] = [
  { id: "princess", name: { en: "Princess", ar: "أميرات" } },
  { id: "cars", name: { en: "Cars", ar: "سيارات" } },
  { id: "space", name: { en: "Space", ar: "فضاء" } },
  { id: "animals", name: { en: "Animals", ar: "حيوانات" } },
  { id: "moon-stars", name: { en: "Moon & Stars", ar: "قمر ونجوم" } },
  { id: "ramadan", name: { en: "Ramadan", ar: "رمضان" } },
  { id: "cute", name: { en: "Cute", ar: "لطيف" } },
  { id: "traditional", name: { en: "Traditional", ar: "تقليدي" } },
];
