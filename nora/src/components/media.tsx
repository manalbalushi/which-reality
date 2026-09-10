"use client";

import { useState } from "react";
import { Swatch } from "@/lib/types";
import { CategoryIcon } from "./icons";

export function Frame({
  swatch,
  image,
  alt = "",
  className = "",
  iconClassName = "w-9 h-9",
}: {
  swatch: Swatch;
  image?: string;
  alt?: string;
  className?: string;
  iconClassName?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showPhoto = !!image && !failed;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.5),0_14px_26px_-16px_rgba(36,31,25,.4)] ${className}`}
      style={{
        background: `linear-gradient(150deg, ${swatch.from} 0%, ${swatch.to} 100%)`,
      }}
    >
      {/* Illustrated placeholder — always mounted underneath, so a slow or
          failed photo load never leaves an empty tile. */}
      <div
        aria-hidden
        className={`absolute inset-0 transition-opacity duration-500 ${showPhoto && loaded ? "opacity-0" : "opacity-100"}`}
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
              "radial-gradient(120% 90% at 25% 15%, rgba(255,255,255,.55), rgba(255,255,255,0) 55%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center justify-center rounded-full bg-white/60 p-3 shadow-[0_6px_16px_-8px_rgba(0,0,0,.25)]">
            <CategoryIcon name={swatch.icon} className={iconClassName} style={{ color: swatch.accent }} />
          </div>
        </div>
      </div>

      {showPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
