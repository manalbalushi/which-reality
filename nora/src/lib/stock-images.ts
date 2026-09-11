/**
 * A small, hand-curated set of real Unsplash photos standing in for NORA's
 * own product photography until real shoots exist. Each ID was found via
 * web search (not fetched/pixel-verified in this environment), so every
 * <ProductImage> consumer must fail over to the illustrated tile on a load
 * error — see components/media.tsx.
 */
function unsplash(id: string, w = 800) {
  return `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;
}

export const stockImages = {
  candle: unsplash("bUgjIlOPhJs"),
  chocolate: unsplash("DPNrBT1WCMs"),
  coffee: unsplash("A3K6lKG4yKY"),
  coffeeAlt: unsplash("JmvRVHyO3Oo"),
  dates: unsplash("Ae6qKztd0Xw"),
  datesAlt: unsplash("MV_nCPtkgDI"),
  packagingGiftBox: unsplash("IsOQu4nML-Y"),
  packagingBasket: unsplash("hO31_kTUA3g"),
  packagingGiftBag: unsplash("1Pgq9ZpIatI"),
  perfume: unsplash("LkT5-JCePUY"),
  beauty: unsplash("UYJTgxZtUmk"),
  stationery: unsplash("9byKncZaV0c"),
  accessories: unsplash("FBBwDcrDt7U"),
  home: unsplash("l0ah3UBLppo"),
  drinkware: unsplash("uIDmFABRKyw"),
  kidsToy: unsplash("s7nHwCnq3c8"),
  graduation: unsplash("FTiBaowRI6I"),
  qaranqashouh: unsplash("yxieo9QaLEk"),
};
