"use client";

import Link from "next/link";
import { Occasion } from "@/lib/types";
import { Frame } from "./media";
import { useLocale } from "@/lib/locale-context";

export function OccasionCard({ occasion }: { occasion: Occasion }) {
  const { text } = useLocale();
  return (
    <Link href={`/occasions/${occasion.slug}`} className="group block">
      <Frame swatch={occasion.swatch} className="aspect-square w-full card-hover" iconClassName="w-9 h-9" />
      <p className="mt-3 text-center font-serif text-[15px] group-hover:text-taupe">{text(occasion.name)}</p>
    </Link>
  );
}
