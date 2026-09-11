import type { RiskRating } from "@/types/domain";

/**
 * Default 5x5 matrix thresholds — mirrors supabase/seed.sql
 * risk_rating_thresholds. Administrators can change the authoritative
 * values in that table (see fn_risk_rating in the database); this map is
 * used only for client-side badge rendering before/without a DB round trip.
 */
export const DEFAULT_THRESHOLDS: { rating: RiskRating; min: number; max: number; color: string }[] = [
  { rating: "Low", min: 1, max: 4, color: "#2E7D32" },
  { rating: "Medium", min: 5, max: 9, color: "#F9A825" },
  { rating: "High", min: 10, max: 16, color: "#EF6C00" },
  { rating: "Critical", min: 17, max: 25, color: "#C62828" },
];

export function ratingForScore(score: number | null | undefined): RiskRating | null {
  if (score == null) return null;
  const t = DEFAULT_THRESHOLDS.find((t) => score >= t.min && score <= t.max);
  return t?.rating ?? null;
}

export function colorForRating(rating: string | null | undefined): string {
  const t = DEFAULT_THRESHOLDS.find((t) => t.rating === rating);
  return t?.color ?? "#667085";
}

export function colorForScore(score: number | null | undefined): string {
  return colorForRating(ratingForScore(score));
}

export const LIKELIHOOD_LABELS: Record<number, string> = {
  1: "Rare",
  2: "Unlikely",
  3: "Possible",
  4: "Likely",
  5: "Almost Certain",
};

export const IMPACT_LABELS: Record<number, string> = {
  1: "Insignificant",
  2: "Minor",
  3: "Moderate",
  4: "Major",
  5: "Severe",
};

export function riskReductionPct(inherent: number | null, residual: number | null): number | null {
  if (inherent == null || residual == null || inherent === 0) return null;
  return Math.round((1 - residual / inherent) * 1000) / 10;
}
