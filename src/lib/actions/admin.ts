"use server";

import { revalidatePath } from "next/cache";
import { requireProfile, isAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/domain";

async function requireAdmin() {
  const profile = await requireProfile();
  if (!isAdmin(profile.role)) throw new Error("Only administrators can change configuration.");
  return profile;
}

const REFERENCE_TABLES = [
  "departments",
  "business_units",
  "risk_categories",
  "control_categories",
] as const;
type ReferenceTable = (typeof REFERENCE_TABLES)[number];

export async function addReferenceItem(table: ReferenceTable, name: string) {
  await requireAdmin();
  if (!REFERENCE_TABLES.includes(table)) throw new Error("Invalid table.");
  if (!name.trim()) throw new Error("Name is required.");
  const supabase = await createClient();
  const { error } = await supabase.from(table).insert({ name: name.trim() });
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function toggleReferenceItem(table: ReferenceTable, id: string, isActive: boolean) {
  await requireAdmin();
  if (!REFERENCE_TABLES.includes(table)) throw new Error("Invalid table.");
  const supabase = await createClient();
  const { error } = await supabase.from(table).update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function updateRiskThreshold(id: string, patch: { min_score: number; max_score: number; color: string }) {
  await requireAdmin();
  if (patch.min_score > patch.max_score) throw new Error("Minimum score cannot exceed maximum score.");
  const supabase = await createClient();
  const { error } = await supabase.from("risk_rating_thresholds").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function addControl(form: { control_code: string; name: string; description?: string; category_id?: string }) {
  await requireAdmin();
  if (!form.control_code.trim() || !form.name.trim()) throw new Error("Control code and name are required.");
  const supabase = await createClient();
  const { error } = await supabase.from("controls").insert(form);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function toggleControl(id: string, isActive: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("controls").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin");
}

export async function updateUserRole(userId: string, role: UserRole) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("profiles").update({ is_active: isActive }).eq("id", userId);
  revalidatePath("/admin/users");
}
