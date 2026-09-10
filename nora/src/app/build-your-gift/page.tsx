import { Suspense } from "react";
import type { Metadata } from "next";
import { BuilderClient } from "./builder-client";

export const metadata: Metadata = {
  title: "Build Your Gift",
  description:
    "Design a personalized gift for any occasion in Oman. Choose the recipient, occasion, budget, style and packaging — NORA curates the products for you.",
};

export default function BuildYourGiftPage() {
  return (
    <Suspense fallback={<div className="container-nora py-24" />}>
      <BuilderClient />
    </Suspense>
  );
}
