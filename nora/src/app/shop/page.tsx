import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopClient } from "./shop-client";

export const metadata: Metadata = {
  title: "Shop Luxury Gifts in Oman",
  description:
    "Browse NORA's curated catalog of gifts in Oman — beauty, perfume, candles, coffee, chocolate, dates, Omani products and more. Filter by occasion, style and budget.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container-nora py-24" />}>
      <ShopClient />
    </Suspense>
  );
}
