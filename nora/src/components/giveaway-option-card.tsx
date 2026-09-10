"use client";

import { useLocale } from "@/lib/locale-context";
import { formatOMR } from "@/lib/format";
import { Frame } from "@/components/media";
import { GiveawayOption } from "@/lib/recommend";

export function GiveawayOptionCard({
  option,
  quantity,
  onCustomize,
  onAddToCart,
  justAdded,
}: {
  option: GiveawayOption;
  quantity: number;
  onCustomize: () => void;
  onAddToCart: () => void;
  justAdded: boolean;
}) {
  const { t, text, locale } = useLocale();
  const name = text(option.packaging.name);

  return (
    <div className="rounded-3xl border border-line bg-ivory overflow-hidden flex flex-col">
      <div className="relative">
        <Frame
          swatch={option.packaging.swatch}
          image={option.packaging.image}
          alt={name}
          className="aspect-[4/3] w-full rounded-none"
          iconClassName="w-14 h-14"
        />
        <span className="absolute top-3 start-3 rounded-full bg-charcoal text-cream text-[10px] uppercase tracking-wider px-3 py-1.5">
          {text(option.label)}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="font-serif text-lg leading-snug">{name}</p>

        <p className="mt-3 text-[11px] uppercase tracking-wider text-charcoal-soft">{t("includes")}</p>
        <ul className="mt-1.5 space-y-1 text-sm text-charcoal-soft">
          {option.products.map((p) => (
            <li key={p.id}>• {text(p.name)}</li>
          ))}
        </ul>

        <div className="mt-auto pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-charcoal-soft">
              {formatOMR(option.perGiftTotal, locale)} {t("per_gift_price")}
            </span>
            <span className="font-serif text-xl">{formatOMR(option.batchTotal, locale)}</span>
          </div>
          <p className="text-end text-xs text-charcoal-soft mt-0.5">
            {t("batch_total").replace("{n}", String(quantity))}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={onCustomize}
              className="flex-1 rounded-full border border-charcoal px-4 py-2.5 text-xs uppercase tracking-wider hover:bg-charcoal hover:text-cream transition-colors"
            >
              {t("customize")}
            </button>
            <button
              onClick={onAddToCart}
              className="flex-1 rounded-full bg-charcoal text-cream px-4 py-2.5 text-xs uppercase tracking-wider hover:bg-charcoal-soft transition-colors"
            >
              {justAdded ? "✓" : t("add_to_cart")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
