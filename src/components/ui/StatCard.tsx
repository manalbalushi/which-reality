import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  href,
  hint,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "default" | "critical" | "high" | "medium" | "low" | "good";
  href?: string;
  hint?: string;
}) {
  const toneStyles: Record<string, string> = {
    default: "text-navy-900 bg-brand-50",
    critical: "text-white bg-rating-critical",
    high: "text-white bg-rating-high",
    medium: "text-navy-900 bg-rating-medium",
    low: "text-white bg-rating-low",
    good: "text-white bg-navy-800",
  };

  const content = (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      {Icon && (
        <div className={clsx("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", toneStyles[tone])}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        {hint && <p className="mt-0.5 truncate text-[11px] text-slate-400">{hint}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
