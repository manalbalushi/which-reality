import { clsx } from "clsx";
import { colorForRating } from "@/lib/risk";

export function Badge({
  children,
  color = "slate",
  className,
}: {
  children: React.ReactNode;
  color?: "slate" | "blue" | "green" | "amber" | "red" | "navy";
  className?: string;
}) {
  const styles: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    blue: "bg-brand-50 text-brand-600 ring-brand-100",
    green: "bg-green-50 text-green-700 ring-green-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    navy: "bg-navy-900 text-white ring-navy-800",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        styles[color],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Colored risk-rating pill driven by the same thresholds as the DB. */
export function RiskRatingBadge({
  rating,
  score,
  size = "md",
}: {
  rating: string | null | undefined;
  score?: number | null;
  size?: "sm" | "md" | "lg";
}) {
  if (!rating) return <Badge color="slate">Not rated</Badge>;
  const color = colorForRating(rating);
  const sizes = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5 font-semibold",
  };
  return (
    <span
      className={clsx("inline-flex items-center gap-1.5 rounded-full font-medium text-white", sizes[size])}
      style={{ backgroundColor: color }}
    >
      {rating}
      {score != null && <span className="opacity-90">· {score}</span>}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const map: Record<string, "slate" | "blue" | "green" | "amber" | "red"> = {
    draft: "slate",
    in_progress: "blue",
    pending_approval: "amber",
    risk_manager_review: "amber",
    process_owner_review: "amber",
    approver_review: "amber",
    approved: "green",
    completed: "green",
    rejected: "red",
    archived: "slate",
    open: "slate",
    overdue: "red",
    cancelled: "slate",
    on_hold: "amber",
  };
  return <Badge color={map[status] ?? "slate"}>{label}</Badge>;
}
