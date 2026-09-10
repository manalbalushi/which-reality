"use client";

import { Packaging } from "@/lib/types";
import { Frame } from "./media";
import { useLocale } from "@/lib/locale-context";
import { formatOMR } from "@/lib/format";
import { UIIcon } from "./icons";

export function PackagingCard({
  packaging,
  selected,
  onSelect,
}: {
  packaging: Packaging;
  selected: boolean;
  onSelect: () => void;
}) {
  const { text, locale } = useLocale();
  return (
    <button
      onClick={onSelect}
      className={`text-start rounded-2xl border p-3 transition-colors ${
        selected ? "border-charcoal bg-beige/60" : "border-line hover:border-taupe"
      }`}
    >
      <div className="relative">
        <Frame swatch={packaging.swatch} image={packaging.image} alt={text(packaging.name)} className="aspect-square w-full" iconClassName="w-10 h-10" />
        {selected && (
          <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-charcoal text-cream">
            <UIIcon name="check" className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
      <p className="mt-3 font-serif text-[15px]">{text(packaging.name)}</p>
      <p className="mt-1 text-xs text-charcoal-soft leading-relaxed">{text(packaging.description)}</p>
      <p className="mt-2 text-sm">+{formatOMR(packaging.price, locale)}</p>
    </button>
  );
}
