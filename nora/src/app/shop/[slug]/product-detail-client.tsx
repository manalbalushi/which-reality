"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { Frame } from "@/components/media";
import { useLocale } from "@/lib/locale-context";
import { formatOMR } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { UIIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { packagingTypes } from "@/data/packaging";
import { suggestedPackagingIds } from "@/lib/packaging-map";

export function ProductDetailClient({ product }: { product: Product }) {
  const { text, locale, t } = useLocale();
  const { addProduct } = useCart();
  const [qty, setQty] = useState(1);
  const [packagingId, setPackagingId] = useState(suggestedPackagingIds(product.category)[0]);
  const [added, setAdded] = useState(false);

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const category = categories.find((c) => c.id === product.category);
  const availablePackaging = packagingTypes.filter((p) =>
    suggestedPackagingIds(product.category).includes(p.id)
  );

  const shareText = encodeURIComponent(
    `${text(product.name)} — ${formatOMR(product.price, locale)} · NORA Gifts Oman`
  );
  const shareUrl =
    typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";

  return (
    <div className="container-nora py-12 sm:py-16">
      <nav className="text-xs text-charcoal-soft mb-8 flex items-center gap-2">
        <Link href="/shop" className="hover:text-taupe">{t("nav_shop")}</Link>
        <span>/</span>
        {category && <span>{text(category.name)}</span>}
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        <Frame swatch={product.swatch} className="aspect-square w-full" iconClassName="w-20 h-20" />

        <div>
          {product.badge && (
            <span className="inline-block text-[11px] uppercase tracking-wider bg-beige px-3 py-1 rounded-full mb-4">
              {text(product.badge)}
            </span>
          )}
          <h1 className="font-serif text-3xl sm:text-4xl leading-tight">{text(product.name)}</h1>
          <p className="mt-3 text-xl">{formatOMR(product.price, locale)}</p>

          <p className="mt-6 text-charcoal-soft leading-relaxed">{text(product.description)}</p>

          {availablePackaging.length > 0 && (
            <div className="mt-8">
              <p className="text-xs uppercase tracking-wider text-charcoal-soft mb-3">
                {t("packaging")}
              </p>
              <div className="flex flex-wrap gap-2">
                {availablePackaging.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPackagingId(p.id)}
                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                      packagingId === p.id
                        ? "bg-charcoal text-cream border-charcoal"
                        : "border-line hover:bg-beige"
                    }`}
                  >
                    {text(p.name)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <p className="text-xs uppercase tracking-wider text-charcoal-soft">{t("quantity")}</p>
            <div className="flex items-center border border-line rounded-full">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="p-2.5"
                aria-label="Decrease"
              >
                <UIIcon name="minus" className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-2.5" aria-label="Increase">
                <UIIcon name="plus" className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => {
                addProduct(product.id, qty, product.price);
                setAdded(true);
                setTimeout(() => setAdded(false), 2000);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal text-cream px-8 py-3.5 text-sm uppercase tracking-wider hover:bg-charcoal-soft transition-colors"
            >
              {added ? t("order_confirmed") : t("add_to_cart")}
            </button>
            <a
              href={`https://wa.me/96890000000?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-charcoal px-6 py-3.5 text-sm uppercase tracking-wider hover:bg-charcoal hover:text-cream transition-colors"
            >
              <UIIcon name="whatsapp" className="w-4 h-4" />
              {t("order_via_whatsapp")}
            </a>
          </div>

          {shareUrl && (
            <a
              href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-xs text-charcoal-soft hover:text-taupe"
            >
              <UIIcon name="whatsapp" className="w-3.5 h-3.5" />
              {t("share_gift")}
            </a>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="font-serif text-2xl mb-8">{t("related_products")}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
