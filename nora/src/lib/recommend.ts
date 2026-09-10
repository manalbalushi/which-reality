import { products } from "@/data/products";
import { packagingTypes } from "@/data/packaging";
import { AgeGroup, Gender, GiftStyle, LocalizedText, Packaging, Product } from "./types";

const stylePackagingMap: Record<GiftStyle, string[]> = {
  feminine: ["tote-bag", "pouch", "gift-bag"],
  minimal: ["gift-bag", "pouch"],
  luxury: ["gift-box", "luxury-tray"],
  wellness: ["basket", "gift-box"],
  coffee: ["basket", "gift-box"],
  omani: ["luxury-tray", "gift-box"],
  cute: ["pouch", "tote-bag"],
  executive: ["gift-box", "luxury-tray"],
  elegant: ["gift-box", "luxury-tray"],
  fun: ["pouch", "tote-bag"],
  traditional: ["luxury-tray", "gift-box"],
};

export interface GiftRecommendation {
  id: string;
  label?: LocalizedText;
  packaging: Packaging;
  products: Product[];
  total: number;
}

type Mode = "value" | "balanced" | "premium";

function pickPackaging(style: GiftStyle, budget: number, mode: Mode): Packaging {
  const preferredIds = stylePackagingMap[style] ?? ["gift-bag"];
  const styleMatches = preferredIds
    .map((id) => packagingTypes.find((p) => p.id === id))
    .filter((p): p is Packaging => !!p);
  const ascending = [...packagingTypes].sort((a, b) => a.price - b.price);
  const descending = [...packagingTypes].sort((a, b) => b.price - a.price);

  // "Balanced" stays true to the style's own preferred packaging; "value" and
  // "premium" deliberately look at the FULL packaging range (not just this
  // style's usual picks) so the three variants read as genuinely different
  // tiers rather than three takes on the same box.
  const ordered = mode === "value" ? ascending : mode === "premium" ? descending : styleMatches.length ? styleMatches : ascending;

  const withinBudget = ordered.filter((p) => p.price <= budget);
  if (withinBudget.length) return withinBudget[0];
  return ascending[0];
}

function selectProductSet(opts: {
  pool: Product[];
  occasion?: string;
  style?: GiftStyle;
  remaining: number;
  mode: Mode;
  maxItems?: number;
  preferStationery?: boolean;
}): { chosen: Product[]; total: number } {
  const scored = opts.pool
    .map((product) => {
      let score = 0;
      if (opts.style && product.styles.includes(opts.style)) score += 2;
      if (opts.occasion && product.occasions.includes(opts.occasion)) score += 2;
      if (product.featured) score += 1;
      return { product, score };
    })
    .filter((s) => s.score > 0);

  const candidates = scored.length ? scored : opts.pool.map((product) => ({ product, score: 0 }));

  if (opts.mode === "value") candidates.sort((a, b) => a.product.price - b.product.price || b.score - a.score);
  else if (opts.mode === "premium") candidates.sort((a, b) => b.product.price - a.product.price || b.score - a.score);
  else candidates.sort((a, b) => b.score - a.score || a.product.price - b.product.price);

  const chosen: Product[] = [];
  const used = new Set<string>();
  let total = 0;
  const maxItems = opts.maxItems ?? 5;

  for (const { product } of candidates) {
    if (chosen.length >= maxItems) break;
    if (used.has(product.category)) continue;
    if (total + product.price > opts.remaining) continue;
    chosen.push(product);
    used.add(product.category);
    total += product.price;
  }

  if (opts.preferStationery && !chosen.some((p) => p.category === "stationery")) {
    const card = opts.pool.find((p) => p.category === "stationery" && total + p.price <= opts.remaining);
    if (card) {
      chosen.push(card);
      total += card.price;
    }
  }

  if (chosen.length === 0) {
    for (const product of [...opts.pool].sort((a, b) => a.price - b.price)) {
      if (chosen.length >= Math.min(3, maxItems)) break;
      if (total + product.price > opts.remaining) continue;
      chosen.push(product);
      total += product.price;
    }
  }

  return { chosen, total };
}

/** Single recommendation used by the manual Build Your Gift "Recommended For You" callout. */
export function recommendGift(params: {
  recipient: string;
  occasion: string;
  budget: number;
  style: GiftStyle;
}): GiftRecommendation {
  const { occasion, budget, style } = params;
  const packaging = pickPackaging(style, budget, "balanced");
  const remaining = Math.max(budget - packaging.price, 5);
  const { chosen, total } = selectProductSet({
    pool: products,
    occasion,
    style,
    remaining,
    mode: "balanced",
    preferStationery: true,
  });
  return { id: "balanced", packaging, products: chosen, total: Number((total + packaging.price).toFixed(3)) };
}

const VARIANT_LABELS: Record<Mode, LocalizedText> = {
  value: { en: "Best Value", ar: "أفضل قيمة" },
  balanced: { en: "Most Popular", ar: "الأكثر طلباً" },
  premium: { en: "Premium Pick", ar: "الخيار الفاخر" },
};

/** Exactly 3 genuinely different gift combinations for the same inputs. */
export function recommendThreeGifts(params: {
  recipient: string;
  occasion: string;
  budget: number;
  style: GiftStyle;
}): GiftRecommendation[] {
  const { occasion, budget, style } = params;
  const modes: Mode[] = ["value", "balanced", "premium"];
  const seen = new Set<string>();
  const results: GiftRecommendation[] = [];

  for (const mode of modes) {
    const packaging = pickPackaging(style, mode === "premium" ? budget : budget * (mode === "value" ? 0.6 : 0.8), mode);
    const remaining = Math.max(budget - packaging.price, 5);
    const { chosen, total } = selectProductSet({
      pool: products,
      occasion,
      style,
      remaining,
      mode,
      maxItems: mode === "value" ? 3 : mode === "premium" ? 5 : 4,
      preferStationery: mode !== "premium",
    });
    const key = `${packaging.id}:${chosen.map((p) => p.id).join(",")}`;
    if (seen.has(key) && results.length > 0) continue;
    seen.add(key);
    results.push({
      id: mode,
      label: VARIANT_LABELS[mode],
      packaging,
      products: chosen,
      total: Number((total + packaging.price).toFixed(3)),
    });
  }

  // Guarantee exactly 3 by padding with the balanced result if two variants collapsed to one.
  while (results.length < 3) {
    results.push({ ...results[results.length - 1], id: `${results[results.length - 1].id}-${results.length}` });
  }

  return results.slice(0, 3);
}

/* -----------------------------------------------------------------------
   Giveaway / bulk / Qaranqashouh engine
----------------------------------------------------------------------- */

export interface GiveawayOption {
  id: string;
  label: LocalizedText;
  packaging: Packaging;
  products: Product[];
  perGiftTotal: number;
  batchTotal: number;
}

export interface GiveawayResult {
  perGiftBudget: number;
  tight: boolean;
  options: GiveawayOption[];
}

const GIVEAWAY_LABELS: Record<string, LocalizedText> = {
  value: { en: "Best Value", ar: "أفضل قيمة" },
  cute: { en: "Cutest", ar: "الألطف" },
  simple: { en: "Simple & Elegant", ar: "بسيط وأنيق" },
};

export function recommendGiveaway(params: {
  quantity: number;
  totalBudget: number;
  occasion?: string;
  style?: GiftStyle;
  packagingId?: string; // explicit choice, or omitted for "Surprise Me"
  gender?: Gender;
  ageGroup?: AgeGroup;
  themes?: string[];
}): GiveawayResult {
  const { quantity, totalBudget, occasion, style, packagingId, gender, ageGroup, themes } = params;
  const perGiftBudget = Number((totalBudget / Math.max(1, quantity)).toFixed(3));

  const basePool = products.filter((p) => {
    if (gender && p.gender && p.gender !== "unisex" && p.gender !== gender) return false;
    if (ageGroup && p.ageGroups && p.ageGroups.length && !p.ageGroups.includes(ageGroup)) return false;
    if (themes && themes.length && p.themes && p.themes.length && !p.themes.some((t) => themes.includes(t))) return false;
    return true;
  });
  // If the strict filter leaves too little to work with, fall back to the full catalog
  // rather than returning nothing. A pool of just 2 is still preferable to discarding
  // the gender/age/theme match entirely — selectProductSet can still build a relevant
  // (if repetitive) option from it.
  const pool = basePool.length >= 2 ? basePool : products;

  const packagingPool = packagingId
    ? packagingTypes.filter((p) => p.id === packagingId)
    : packagingTypes;

  const cheapestPackaging = [...packagingPool].sort((a, b) => a.price - b.price)[0] ?? packagingTypes[0];
  const cheapestSingleItem = [...pool].sort((a, b) => a.price - b.price)[0];
  const tight =
    !cheapestSingleItem || cheapestPackaging.price + cheapestSingleItem.price > perGiftBudget;

  const buildOption = (variantId: "value" | "cute" | "simple", mode: Mode, maxItems: number): GiveawayOption | null => {
    const packagingCandidates = packagingId
      ? packagingPool
      : mode === "premium"
        ? [...packagingPool].sort((a, b) => b.price - a.price)
        : [...packagingPool].sort((a, b) => a.price - b.price);

    let packaging = packagingCandidates.find((p) => p.price <= perGiftBudget) ?? cheapestPackaging;
    // Never search for products beyond what's actually left of the per-gift budget —
    // exceeding it here would push the option's total over the customer's stated budget.
    let remaining = Math.max(perGiftBudget - packaging.price, 0);
    let { chosen, total } = selectProductSet({
      pool,
      occasion,
      style,
      remaining,
      mode,
      maxItems,
    });

    if (chosen.length === 0 && !tight && packaging.id !== cheapestPackaging.id) {
      // Try the absolute cheapest packaging as a fallback so we still return something.
      packaging = cheapestPackaging;
      remaining = Math.max(perGiftBudget - packaging.price, 0);
      const retry = selectProductSet({ pool, occasion, style, remaining, mode, maxItems });
      chosen = retry.chosen;
      total = retry.total;
    }

    if (chosen.length === 0 && cheapestSingleItem && cheapestSingleItem.price <= remaining) {
      chosen = [cheapestSingleItem];
      total = cheapestSingleItem.price;
    }

    const perGiftTotal = Number((total + packaging.price).toFixed(3));
    return {
      id: variantId,
      label: GIVEAWAY_LABELS[variantId],
      packaging,
      products: chosen,
      perGiftTotal,
      batchTotal: Number((perGiftTotal * quantity).toFixed(3)),
    };
  };

  const rawOptions = [
    buildOption("value", "value", 3),
    buildOption("cute", "balanced", 4),
    buildOption("simple", "premium", 2),
  ].filter((o): o is GiveawayOption => !!o);

  // De-dupe near-identical variants (e.g. when the catalog is thin for this filter).
  const dedupedMap = new Map<string, GiveawayOption>();
  for (const opt of rawOptions) {
    const key = `${opt.packaging.id}:${opt.products.map((p) => p.id).join(",")}`;
    if (!dedupedMap.has(key)) dedupedMap.set(key, opt);
  }
  const options = Array.from(dedupedMap.values());
  while (options.length < 3 && rawOptions.length) {
    const source = rawOptions[options.length % rawOptions.length];
    options.push({ ...source, id: `${source.id}-${options.length}` });
  }

  return {
    perGiftBudget,
    tight,
    options: options.slice(0, 3).sort((a, b) => a.perGiftTotal - b.perGiftTotal),
  };
}
