"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { occasions } from "@/data/occasions";
import { styles } from "@/data/styles";
import { packagingTypes } from "@/data/packaging";
import { suggestedPackagingIds } from "@/lib/packaging-map";
import { useLocale } from "@/lib/locale-context";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section";
import { UIIcon } from "@/components/icons";

const priceBuckets = [
  { id: "under-10", label: "Under OMR 10", min: 0, max: 10 },
  { id: "10-20", label: "OMR 10 – 20", min: 10, max: 20 },
  { id: "20-40", label: "OMR 20 – 40", min: 20, max: 40 },
  { id: "40-plus", label: "OMR 40+", min: 40, max: Infinity },
];

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="border-b border-line py-5">
      <p className="text-xs uppercase tracking-wider text-charcoal-soft mb-3">{title}</p>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label key={opt.id} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(opt.id)}
              onChange={() => onToggle(opt.id)}
              className="accent-[var(--color-charcoal)] w-4 h-4"
            />
            <span className={selected.includes(opt.id) ? "text-charcoal" : "text-charcoal-soft"}>
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function ShopClient() {
  const { text, t, locale } = useLocale();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [cats, setCats] = useState<string[]>([]);
  const [occ, setOcc] = useState<string[]>([]);
  const [sty, setSty] = useState<string[]>([]);
  const [pkg, setPkg] = useState<string[]>([]);
  const [price, setPrice] = useState<string[]>([]);
  const [sort, setSort] = useState("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggle = (list: string[], id: string, setter: (v: string[]) => void) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (query && !text(p.name).toLowerCase().includes(query.toLowerCase())) return false;
      if (cats.length && !cats.includes(p.category)) return false;
      if (occ.length && !p.occasions.some((o) => occ.includes(o))) return false;
      if (sty.length && !p.styles.some((s) => sty.includes(s))) return false;
      if (pkg.length) {
        const compatible = suggestedPackagingIds(p.category);
        if (!compatible.some((id) => pkg.includes(id))) return false;
      }
      if (price.length) {
        const bucket = priceBuckets.filter((b) => price.includes(b.id));
        if (!bucket.some((b) => p.price >= b.min && p.price < b.max)) return false;
      }
      return true;
    });

    if (sort === "price-low") result = [...result].sort((a, b) => a.price - b.price);
    else if (sort === "price-high") result = [...result].sort((a, b) => b.price - a.price);
    else if (sort === "newest") result = [...result].reverse();
    else result = [...result].sort((a, b) => Number(b.featured) - Number(a.featured));

    return result;
  }, [query, cats, occ, sty, pkg, price, sort, text]);

  const clearAll = () => {
    setCats([]);
    setOcc([]);
    setSty([]);
    setPkg([]);
    setPrice([]);
    setQuery("");
  };

  const activeCount = cats.length + occ.length + sty.length + pkg.length + price.length;

  return (
    <div className="container-nora py-12 sm:py-16">
      <SectionHeading eyebrow="Shop" title={t("nav_shop")} align="left" />

      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3 border border-line rounded-full px-4 py-2.5 max-w-md">
          <UIIcon name="search" className="w-4 h-4 text-taupe shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("nav_search")}
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="lg:hidden flex items-center gap-2 border border-line rounded-full px-4 py-2.5 text-sm"
        >
          {t("filters")} {activeCount > 0 && `(${activeCount})`}
        </button>
      </div>

      <div className="mt-8 grid lg:grid-cols-[240px_1fr] gap-10">
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
          <div className="flex items-center justify-between mb-2">
            <p className="font-serif text-lg">{t("filters")}</p>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-xs text-taupe underline underline-offset-2">
                {t("clear_filters")}
              </button>
            )}
          </div>
          <FilterGroup
            title={t("category")}
            options={categories.map((c) => ({ id: c.id, label: text(c.name) }))}
            selected={cats}
            onToggle={(id) => toggle(cats, id, setCats)}
          />
          <FilterGroup
            title={t("price")}
            options={priceBuckets.map((b) => ({ id: b.id, label: b.label }))}
            selected={price}
            onToggle={(id) => toggle(price, id, setPrice)}
          />
          <FilterGroup
            title={t("occasion")}
            options={occasions.map((o) => ({ id: o.id, label: text(o.name) }))}
            selected={occ}
            onToggle={(id) => toggle(occ, id, setOcc)}
          />
          <FilterGroup
            title={t("style")}
            options={styles.map((s) => ({ id: s.id, label: text(s.name) }))}
            selected={sty}
            onToggle={(id) => toggle(sty, id, setSty)}
          />
          <FilterGroup
            title={t("packaging")}
            options={packagingTypes.map((p) => ({ id: p.id, label: text(p.name) }))}
            selected={pkg}
            onToggle={(id) => toggle(pkg, id, setPkg)}
          />
        </aside>

        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-charcoal-soft">
              {filtered.length} {locale === "ar" ? "منتج" : "products"}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-line rounded-full px-4 py-2 text-sm bg-cream"
            >
              <option value="recommended">{t("sort_recommended")}</option>
              <option value="price-low">{t("sort_price_low")}</option>
              <option value="price-high">{t("sort_price_high")}</option>
              <option value="newest">{t("sort_newest")}</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="text-charcoal-soft py-16 text-center">No products match your filters.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
