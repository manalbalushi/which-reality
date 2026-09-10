"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import { Frame } from "./media";
import { useLocale } from "@/lib/locale-context";
import { formatOMR } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { UIIcon } from "./icons";

export function ProductCard({ product }: { product: Product }) {
  const { text, locale, t } = useLocale();
  const { addProduct } = useCart();

  return (
    <div className="group flex flex-col">
      <Link href={`/shop/${product.slug}`} className="block">
        <Frame swatch={product.swatch} className="aspect-[4/5] w-full card-hover" iconClassName="w-10 h-10" />
      </Link>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <Link href={`/shop/${product.slug}`} className="font-serif text-[15px] leading-snug hover:text-taupe">
            {text(product.name)}
          </Link>
          <p className="mt-1 text-sm text-charcoal-soft">{formatOMR(product.price, locale)}</p>
        </div>
        <button
          onClick={() => addProduct(product.id, 1, product.price)}
          className="shrink-0 rounded-full border border-charcoal/70 p-2 hover:bg-charcoal hover:text-cream transition-colors"
          aria-label={t("add_to_cart")}
        >
          <UIIcon name="plus" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
