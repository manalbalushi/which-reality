import { Suspense } from "react";
import type { Metadata } from "next";
import { GiveawaysClient } from "./giveaways-client";

export const metadata: Metadata = {
  title: "Plan Your Giveaways",
  description:
    "Bulk and distribution gifting for birthdays, weddings, baby showers, graduations, Qaranqashouh, Ramadan, Eid, school events, corporate and majlis. Set your quantity and budget — NORA curates 3 options that fit.",
};

export default function GiveawaysPage() {
  return (
    <Suspense fallback={<div className="container-nora py-24" />}>
      <GiveawaysClient />
    </Suspense>
  );
}
