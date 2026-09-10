export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : ""}>
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.3em] text-taupe mb-3">{eyebrow}</p>
      )}
      <h2 className="font-serif text-3xl sm:text-4xl leading-tight">{title}</h2>
      {subtitle && <p className="mt-3 text-charcoal-soft">{subtitle}</p>}
    </div>
  );
}
