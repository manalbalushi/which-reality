"use client";

export function ChipButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${
        selected
          ? "bg-charcoal text-cream border-charcoal"
          : "border-line hover:border-taupe text-charcoal"
      }`}
    >
      {label}
    </button>
  );
}
