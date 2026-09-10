import { Packaging } from "@/lib/types";

export const packagingTypes: Packaging[] = [
  {
    id: "gift-bag",
    slug: "gift-bag",
    name: { en: "Gift Bag", ar: "حقيبة هدايا" },
    description: {
      en: "A classic ivory bag finished with a silk ribbon — light, elegant, effortless.",
      ar: "حقيبة عاجية كلاسيكية مزينة بشريط حريري — أنيقة وخفيفة.",
    },
    price: 3,
    swatch: { from: "#f3ece2", to: "#dfc6a6", accent: "#7a5a34", icon: "bag" },
  },
  {
    id: "basket",
    slug: "basket",
    name: { en: "Basket", ar: "سلة" },
    description: {
      en: "A woven rattan basket lined with linen — generous, warm and homely.",
      ar: "سلة من الخيزران مبطنة بالكتان — دافئة وواسعة.",
    },
    price: 6,
    swatch: { from: "#f1e9db", to: "#d9bd8e", accent: "#6c4c22", icon: "basket" },
  },
  {
    id: "tote-bag",
    slug: "tote-bag",
    name: { en: "Tote Bag", ar: "حقيبة توتيه" },
    description: {
      en: "A reusable premium canvas tote — a gift within a gift.",
      ar: "حقيبة توتيه فاخرة قابلة لإعادة الاستخدام — هدية داخل هدية.",
    },
    price: 5,
    swatch: { from: "#efe9e4", to: "#cdbba4", accent: "#4c3b28", icon: "tote" },
  },
  {
    id: "pouch",
    slug: "pouch",
    name: { en: "Pouch", ar: "حقيبة صغيرة" },
    description: {
      en: "A soft velvet pouch, perfect for petite and personal gifts.",
      ar: "حقيبة مخملية ناعمة، مثالية للهدايا الصغيرة والشخصية.",
    },
    price: 2,
    swatch: { from: "#f4eaf0", to: "#e0bcd2", accent: "#7a3c5c", icon: "pouch" },
  },
  {
    id: "gift-box",
    slug: "gift-box",
    name: { en: "Gift Box", ar: "علبة هدايا" },
    description: {
      en: "A rigid signature box with magnetic close and tissue lining.",
      ar: "علبة فاخرة بإغلاق مغناطيسي ومبطنة بورق حريري.",
    },
    price: 4,
    swatch: { from: "#efe6d8", to: "#d8b98a", accent: "#5c4322", icon: "box" },
  },
  {
    id: "luxury-tray",
    slug: "luxury-tray",
    name: { en: "Luxury Tray", ar: "صينية فاخرة" },
    description: {
      en: "A curated wooden tray presentation for showstopping gifts.",
      ar: "صينية خشبية منسقة لهدايا استثنائية.",
    },
    price: 9,
    swatch: { from: "#eae2d6", to: "#c9ab7d", accent: "#4a3a1f", icon: "tray" },
  },
];
