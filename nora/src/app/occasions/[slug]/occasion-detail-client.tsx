"use client";

import { Occasion } from "@/lib/types";
import { products } from "@/data/products";
import { useLocale } from "@/lib/locale-context";
import { Frame } from "@/components/media";
import { ProductCard } from "@/components/product-card";
import { LinkButton } from "@/components/button";

export function OccasionDetailClient({ occasion }: { occasion: Occasion }) {
  const { text, t } = useLocale();
  const matches = products.filter((p) => p.occasions.includes(occasion.id));

  return (
    <div>
      <section className="container-nora py-12 sm:py-16 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-taupe mb-4">{t("nav_occasions")}</p>
          <h1 className="font-serif text-4xl sm:text-5xl leading-tight">{text(occasion.name)}</h1>
          <p className="mt-4 text-lg text-charcoal-soft max-w-md">{text(occasion.blurb)}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <LinkButton href={`/build-your-gift?occasion=${occasion.id}`}>
              {t("build_teaser_cta")}
            </LinkButton>
          </div>
        </div>
        <Frame swatch={occasion.swatch} className="aspect-[4/3] w-full" iconClassName="w-16 h-16" />
      </section>

      <section className="container-nora pb-20 sm:pb-24">
        {matches.length === 0 ? (
          <p className="text-charcoal-soft text-center py-16">
            No products tagged yet — try Build Your Gift to create a custom combination.
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {matches.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
