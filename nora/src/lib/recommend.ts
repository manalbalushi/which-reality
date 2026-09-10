import { products } from "@/data/products";
import { packagingTypes } from "@/data/packaging";
import { GiftStyle, Packaging, Product } from "./types";

const stylePackagingMap: Record<GiftStyle, string[]> = {
  feminine: ["tote-bag", "pouch", "gift-bag"],
  minimal: ["gift-bag", "pouch"],
  luxury: ["gift-box", "luxury-tray"],
  wellness: ["basket", "gift-box"],
  coffee: ["basket", "gift-box"],
  omani: ["luxury-tray", "gift-box"],
  cute: ["pouch", "tote-bag"],
  executive: ["gift-box", "luxury-tray"],
};

export interface GiftRecommendation {
  packaging: Packaging;
  products: Product[];
  total: number;
}

export function recommendGift(params: {
  recipient: string;
  occasion: string;
  budget: number;
  style: GiftStyle;
}): GiftRecommendation {
  const { occasion, budget, style } = params;

  const preferredPackagingIds = stylePackagingMap[style] ?? ["gift-bag"];
  const packaging =
    packagingTypes.find((p) => p.id === preferredPackagingIds[0]) ?? packagingTypes[0];

  const remaining = Math.max(budget - packaging.price, 5);

  const scored = products
    .map((product) => {
      let score = 0;
      if (product.styles.includes(style)) score += 2;
      if (product.occasions.includes(occasion)) score += 2;
      if (product.featured) score += 1;
      return { product, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price);

  const chosen: Product[] = [];
  const usedCategories = new Set<string>();
  let runningTotal = 0;

  for (const { product } of scored) {
    if (chosen.length >= 5) break;
    if (usedCategories.has(product.category)) continue;
    if (runningTotal + product.price > remaining) continue;
    chosen.push(product);
    usedCategories.add(product.category);
    runningTotal += product.price;
  }

  // Ensure at least one greeting card / stationery touch when budget allows.
  const hasCard = chosen.some((p) => p.category === "stationery");
  if (!hasCard) {
    const card = products.find(
      (p) => p.category === "stationery" && runningTotal + p.price <= remaining
    );
    if (card) {
      chosen.push(card);
      runningTotal += card.price;
    }
  }

  // Fallback: if nothing matched, pick the cheapest 3 featured products.
  if (chosen.length === 0) {
    for (const product of products.filter((p) => p.featured).sort((a, b) => a.price - b.price)) {
      if (chosen.length >= 3) break;
      if (runningTotal + product.price > remaining) continue;
      chosen.push(product);
      runningTotal += product.price;
    }
  }

  return {
    packaging,
    products: chosen,
    total: Number((runningTotal + packaging.price).toFixed(3)),
  };
}
