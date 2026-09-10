import { Swatch } from "@/lib/types";
import { CategoryIcon } from "./icons";

export function Frame({
  swatch,
  className = "",
  iconClassName = "w-9 h-9",
}: {
  swatch: Swatch;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl ${className}`}
      style={{
        background: `linear-gradient(150deg, ${swatch.from} 0%, ${swatch.to} 100%)`,
      }}
    >
      <div
        aria-hidden
        className="absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-30"
        style={{ background: swatch.accent }}
      />
      <div
        aria-hidden
        className="absolute -left-8 -bottom-10 h-32 w-32 rounded-full opacity-15"
        style={{ background: swatch.accent }}
      />
      <CategoryIcon name={swatch.icon} className={iconClassName} style={{ color: swatch.accent }} />
    </div>
  );
}
