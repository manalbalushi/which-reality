export type DeliveryMethod = "Standard" | "Express" | "Scheduled";
export type DeliveryRegion = "Muscat" | "Other";

export function getDeliveryFee(method: DeliveryMethod, region: DeliveryRegion): number {
  const base = region === "Muscat" ? 1.5 : 2.5;
  if (method === "Express") return base + 2;
  if (method === "Scheduled") return base + 0.5;
  return base;
}

export const omanCities = [
  "Muscat",
  "Muttrah",
  "Seeb",
  "Bawshar",
  "Al Amerat",
  "Salalah",
  "Sohar",
  "Nizwa",
  "Sur",
  "Ibri",
  "Rustaq",
  "Barka",
];
