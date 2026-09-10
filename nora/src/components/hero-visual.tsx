import { Frame } from "./media";
import { packagingTypes } from "@/data/packaging";
import { products } from "@/data/products";

export function HeroVisual() {
  const [box, basket, tote, pouch] = packagingTypes;
  const perfume = products.find((p) => p.id === "p03")!;
  const candle = products.find((p) => p.id === "p05")!;

  return (
    <div className="relative aspect-[6/5] w-full">
      <Frame
        swatch={basket.swatch}
        image={basket.image}
        className="absolute left-0 top-6 w-[58%] aspect-[5/4] rotate-[-3deg] shadow-xl"
        iconClassName="w-14 h-14"
      />
      <Frame
        swatch={box.swatch}
        image={box.image}
        className="absolute right-0 top-0 w-[44%] aspect-square rotate-[4deg] shadow-xl"
        iconClassName="w-12 h-12"
      />
      <Frame
        swatch={tote.swatch}
        className="absolute left-[8%] bottom-0 w-[38%] aspect-[4/5] rotate-[3deg] shadow-xl"
        iconClassName="w-10 h-10"
      />
      <Frame
        swatch={perfume.swatch}
        className="absolute right-[6%] bottom-4 w-[30%] aspect-square rotate-[-4deg] shadow-xl"
        iconClassName="w-9 h-9"
      />
      <Frame
        swatch={pouch.swatch}
        className="absolute left-[38%] bottom-[6%] w-[24%] aspect-square rotate-[-8deg] shadow-lg hidden sm:flex"
        iconClassName="w-7 h-7"
      />
      <Frame
        swatch={candle.swatch}
        image={candle.image}
        className="absolute right-[32%] top-[38%] w-[22%] aspect-square rotate-[6deg] shadow-lg hidden sm:flex"
        iconClassName="w-7 h-7"
      />
    </div>
  );
}
