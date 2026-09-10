const categoryPackaging: Record<string, string[]> = {
  beauty: ["pouch", "gift-bag", "tote-bag"],
  perfume: ["gift-box", "pouch", "gift-bag"],
  candles: ["luxury-tray", "gift-box", "basket"],
  coffee: ["basket", "gift-box", "luxury-tray"],
  chocolate: ["gift-box", "basket", "tote-bag"],
  dates: ["luxury-tray", "gift-box", "basket"],
  stationery: ["gift-bag", "pouch"],
  accessories: ["gift-box", "pouch"],
  "hair-accessories": ["pouch", "gift-bag"],
  "travel-accessories": ["gift-box", "tote-bag"],
  "self-care": ["basket", "tote-bag", "pouch"],
  home: ["basket", "luxury-tray"],
  "omani-products": ["luxury-tray", "gift-box"],
  "baby-items": ["basket", "gift-box", "pouch"],
};

export function suggestedPackagingIds(category: string): string[] {
  return categoryPackaging[category] ?? ["gift-bag", "gift-box"];
}
