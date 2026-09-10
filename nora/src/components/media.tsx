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
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.5),0_14px_26px_-16px_rgba(36,31,25,.4)] ${className}`}
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
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 22% 12%, rgba(255,255,255,.6), rgba(255,255,255,0) 55%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-50 mix-blend-multiply"
        style={{
          backgroundImage: "radial-gradient(rgba(36,31,25,.05) 1px, transparent 1px)",
          backgroundSize: "5px 5px",
        }}
      />
      <div className="relative z-10 flex items-center justify-center rounded-full bg-white/60 p-3 shadow-[0_8px_18px_-8px_rgba(36,31,25,.35),inset_0_1px_1px_rgba(255,255,255,.8)]">
        <CategoryIcon name={swatch.icon} className={iconClassName} style={{ color: swatch.accent }} />
      </div>
    </div>
  );
}
