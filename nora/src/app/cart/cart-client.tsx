"use client";

import { useCart } from "@/lib/cart-context";
import { useLocale } from "@/lib/locale-context";
import { formatOMR } from "@/lib/format";
import { Frame } from "@/components/media";
import { LinkButton } from "@/components/button";
import { UIIcon } from "@/components/icons";
import { products } from "@/data/products";
import { packagingTypes } from "@/data/packaging";
import { recipients, styles } from "@/data/styles";
import { occasions } from "@/data/occasions";
import { CartItem } from "@/lib/types";

function CartRow({ item }: { item: CartItem }) {
  const { text, locale, t } = useLocale();
  const { updateQuantity, removeItem } = useCart();

  if (item.kind === "product") {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return null;
    return (
      <div className="flex gap-4 py-6 border-b border-line">
        <Frame swatch={product.swatch} image={product.image} alt={text(product.name)} className="w-24 h-24 shrink-0" iconClassName="w-9 h-9" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className="font-serif">{text(product.name)}</p>
            <button onClick={() => removeItem(item.id)} className="text-charcoal-soft hover:text-charcoal">
              <UIIcon name="trash" className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-charcoal-soft mt-1">{formatOMR(item.unitPrice, locale)}</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center border border-line rounded-full w-fit">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2" aria-label="Decrease">
                <UIIcon name="minus" className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2" aria-label="Increase">
                <UIIcon name="plus" className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="font-serif">{formatOMR(item.unitPrice * item.quantity, locale)}</p>
          </div>
        </div>
      </div>
    );
  }

  const packaging = packagingTypes.find((p) => p.id === item.packagingId);
  const recipientLabel = recipients.find((r) => r.id === item.recipient);
  const occasionLabel = occasions.find((o) => o.id === item.occasion);
  const styleLabel = styles.find((s) => s.id === item.style);

  return (
    <div className="flex gap-4 py-6 border-b border-line">
      {packaging && (
        <Frame swatch={packaging.swatch} image={packaging.image} alt={text(packaging.name)} className="w-24 h-24 shrink-0" iconClassName="w-9 h-9" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-taupe">{t("nav_build")}</p>
            <p className="font-serif">
              {[recipientLabel && text(recipientLabel.name), occasionLabel && text(occasionLabel.name)]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <button onClick={() => removeItem(item.id)} className="text-charcoal-soft hover:text-charcoal">
            <UIIcon name="trash" className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-charcoal-soft">
          {styleLabel && <span className="px-2 py-0.5 rounded-full bg-beige">{text(styleLabel.name)}</span>}
          {packaging && <span className="px-2 py-0.5 rounded-full bg-beige">{text(packaging.name)}</span>}
        </div>

        <ul className="mt-2 text-sm text-charcoal-soft space-y-0.5">
          {item.products?.map((line) => {
            const p = products.find((pr) => pr.id === line.productId);
            if (!p) return null;
            return (
              <li key={line.productId}>
                {line.quantity}× {text(p.name)}
              </li>
            );
          })}
        </ul>

        {item.personalization?.recipientName && (
          <p className="mt-2 text-sm">
            {t("gift_recipient_name")}: <span className="italic">{item.personalization.recipientName}</span>
          </p>
        )}
        {item.personalization?.message && (
          <p className="mt-1 text-sm text-charcoal-soft italic">“{item.personalization.message}”</p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center border border-line rounded-full w-fit">
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2" aria-label="Decrease">
              <UIIcon name="minus" className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2" aria-label="Increase">
              <UIIcon name="plus" className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="font-serif">{formatOMR(item.unitPrice * item.quantity, locale)}</p>
        </div>
      </div>
    </div>
  );
}

export function CartClient() {
  const { items, subtotal } = useCart();
  const { t, locale } = useLocale();

  return (
    <div className="container-nora py-12 sm:py-16">
      <h1 className="font-serif text-3xl sm:text-4xl">{t("cart_title")}</h1>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-charcoal-soft">{t("cart_empty")}</p>
          <LinkButton href="/shop" className="mt-6 inline-flex">
            {t("cart_continue")}
          </LinkButton>
        </div>
      ) : (
        <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-12">
          <div>
            {items.map((item) => (
              <CartRow key={item.id} item={item} />
            ))}
          </div>

          <aside className="h-fit rounded-3xl border border-line bg-ivory p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal-soft">{t("subtotal")}</span>
                <span>{formatOMR(subtotal, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-soft">{t("delivery_fee")}</span>
                <span className="text-charcoal-soft">
                  {locale === "ar" ? "يُحسب عند الدفع" : "Calculated at checkout"}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-line flex justify-between items-center">
              <span className="text-sm uppercase tracking-wider">{t("total")}</span>
              <span className="font-serif text-xl">{formatOMR(subtotal, locale)}</span>
            </div>
            <LinkButton href="/checkout" className="mt-6 w-full">
              {t("proceed_checkout")}
            </LinkButton>
            <LinkButton href="/shop" variant="ghost" className="mt-3 w-full">
              {t("cart_continue")}
            </LinkButton>
          </aside>
        </div>
      )}
    </div>
  );
}
