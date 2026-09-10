"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { HeroVisual } from "@/components/hero-visual";
import { SectionHeading } from "@/components/section";
import { LinkButton } from "@/components/button";
import { OccasionCard } from "@/components/occasion-card";
import { ProductCard } from "@/components/product-card";
import { occasions } from "@/data/occasions";
import { featuredProducts } from "@/data/products";
import { UIIcon } from "@/components/icons";

const benefits = [
  { icon: "star" as const, titleKey: "benefit_curated" as const, subKey: "benefit_curated_sub" as const },
  { icon: "arrow-right" as const, titleKey: "benefit_delivery" as const, subKey: "benefit_delivery_sub" as const },
  { icon: "check" as const, titleKey: "benefit_personalized" as const, subKey: "benefit_personalized_sub" as const },
  { icon: "whatsapp" as const, titleKey: "benefit_occasions" as const, subKey: "benefit_occasions_sub" as const },
];

export default function Home() {
  const { t } = useLocale();

  return (
    <div>
      <section className="container-nora pt-12 sm:pt-16 pb-16 sm:pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-up">
          <p className="text-xs uppercase tracking-[0.3em] text-taupe mb-5">{t("tagline")}</p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.1]">
            {t("hero_title")}
          </h1>
          <p className="mt-5 text-lg text-charcoal-soft max-w-md">{t("hero_subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <LinkButton href="/shop" variant="primary">
              {t("hero_cta_shop")}
            </LinkButton>
            <LinkButton href="/build-your-gift" variant="secondary">
              {t("hero_cta_build")}
            </LinkButton>
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-taupe">{t("you_choose_tagline")}</p>
          <p className="mt-1.5 text-sm text-charcoal-soft italic">{t("personalized_tagline")}</p>
        </div>
        <HeroVisual />
      </section>

      <section className="border-y border-line bg-ivory">
        <div className="container-nora py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b) => (
            <div key={b.titleKey} className="flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream border border-line">
                <UIIcon name={b.icon} className="w-5 h-5 text-taupe" />
              </div>
              <div>
                <p className="font-serif text-sm sm:text-base">{t(b.titleKey)}</p>
                <p className="text-xs text-charcoal-soft mt-1">{t(b.subKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-nora py-20 sm:py-24">
        <SectionHeading
          eyebrow="Occasions"
          title={t("shop_by_occasion")}
          subtitle={t("shop_by_occasion_sub")}
        />
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10">
          {occasions.map((o) => (
            <OccasionCard key={o.id} occasion={o} />
          ))}
        </div>
      </section>

      <section className="bg-ivory border-y border-line">
        <div className="container-nora py-20 sm:py-24">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <SectionHeading
              align="left"
              eyebrow="Bestsellers"
              title={t("featured_gifts")}
              subtitle={t("featured_gifts_sub")}
            />
            <Link href="/shop" className="text-sm uppercase tracking-wider hover:text-taupe shrink-0">
              {t("view_all")} →
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-nora py-20 sm:py-24 grid lg:grid-cols-2 gap-8">
        <div className="rounded-3xl bg-charcoal text-cream p-10 sm:p-14 flex flex-col justify-between min-h-[320px]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-nude mb-4">Build Your Gift</p>
            <h3 className="font-serif text-3xl leading-tight">{t("build_teaser_title")}</h3>
            <p className="mt-4 text-cream/80 max-w-sm">{t("build_teaser_sub")}</p>
          </div>
          <LinkButton href="/build-your-gift" variant="ghost" className="mt-8 self-start !border-cream !text-cream hover:!bg-cream hover:!text-charcoal">
            {t("build_teaser_cta")}
          </LinkButton>
        </div>
        <div className="rounded-3xl bg-beige p-10 sm:p-14 flex flex-col justify-between min-h-[320px]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-taupe mb-4">Corporate</p>
            <h3 className="font-serif text-3xl leading-tight">{t("corporate_teaser_title")}</h3>
            <p className="mt-4 text-charcoal-soft max-w-sm">{t("corporate_teaser_sub")}</p>
          </div>
          <LinkButton href="/corporate" variant="secondary" className="mt-8 self-start">
            {t("corporate_teaser_cta")}
          </LinkButton>
        </div>
      </section>

      <section className="container-nora pb-20 sm:pb-24 grid lg:grid-cols-2 gap-8">
        <div className="rounded-3xl bg-ivory border border-line p-10 sm:p-14 flex flex-col justify-between min-h-[280px]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-taupe mb-4">{t("nav_giveaways")}</p>
            <h3 className="font-serif text-3xl leading-tight">{t("giveaways_teaser_title")}</h3>
            <p className="mt-4 text-charcoal-soft max-w-sm">{t("giveaways_teaser_sub")}</p>
          </div>
          <LinkButton href="/giveaways" variant="secondary" className="mt-8 self-start">
            {t("giveaways_teaser_cta")}
          </LinkButton>
        </div>
        <div className="rounded-3xl bg-beige p-10 sm:p-14 flex flex-col justify-between min-h-[280px]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-taupe mb-4">{t("nav_giveaways")}</p>
            <h3 className="font-serif text-3xl leading-tight">{t("qaranqashouh_teaser_title")}</h3>
            <p className="mt-4 text-charcoal-soft max-w-sm">{t("qaranqashouh_teaser_sub")}</p>
          </div>
          <LinkButton href="/giveaways/qaranqashouh" variant="secondary" className="mt-8 self-start">
            {t("qaranqashouh_teaser_cta")}
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
