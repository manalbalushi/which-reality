"use client";

import { occasions } from "@/data/occasions";
import { useLocale } from "@/lib/locale-context";
import { SectionHeading } from "@/components/section";
import { OccasionCard } from "@/components/occasion-card";

export function OccasionsClient() {
  const { t } = useLocale();
  return (
    <div className="container-nora py-12 sm:py-16">
      <SectionHeading
        eyebrow="Occasions"
        title={t("shop_by_occasion")}
        subtitle={t("shop_by_occasion_sub")}
      />
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
        {occasions.map((o) => (
          <OccasionCard key={o.id} occasion={o} />
        ))}
      </div>
    </div>
  );
}
