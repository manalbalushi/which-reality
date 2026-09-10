import { Suspense } from "react";
import type { Metadata } from "next";
import { QaranqashouhClient } from "./qaranqashouh-client";

export const metadata: Metadata = {
  title: "Qaranqashouh Builder",
  description:
    "A dedicated Qaranqashouh giveaway builder — boy, girl or unisex goodie bags by age group and theme. Set your quantity and budget and NORA curates 3 complete packages.",
};

export default function QaranqashouhPage() {
  return (
    <Suspense fallback={<div className="container-nora py-24" />}>
      <QaranqashouhClient />
    </Suspense>
  );
}
