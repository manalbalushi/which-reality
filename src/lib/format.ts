import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

export function fmtDate(value: string | null | undefined, pattern = "dd MMM yyyy"): string {
  if (!value) return "—";
  const d = typeof value === "string" ? parseISO(value) : value;
  return isValid(d) ? format(d, pattern) : "—";
}

export function fmtDateTime(value: string | null | undefined): string {
  return fmtDate(value, "dd MMM yyyy HH:mm");
}

export function fmtRelative(value: string | null | undefined): string {
  if (!value) return "—";
  const d = parseISO(value);
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : "—";
}

export function titleCase(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
