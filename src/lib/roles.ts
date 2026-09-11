import type { UserRole } from "@/types/domain";

/** Pure, client-safe role helpers — no server-only imports (next/headers, supabase server client). */

export const CONTENT_EDITOR_ROLES: UserRole[] = [
  "risk_assessor",
  "process_owner",
  "risk_manager",
  "approver",
  "administrator",
];

export function canEditContent(role: UserRole): boolean {
  return CONTENT_EDITOR_ROLES.includes(role);
}

export function isAdmin(role: UserRole): boolean {
  return role === "administrator";
}

export function canReview(role: UserRole): boolean {
  return ["risk_manager", "process_owner", "approver", "administrator"].includes(role);
}
