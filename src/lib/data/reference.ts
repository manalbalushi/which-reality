import { createClient } from "@/lib/supabase/server";
import type {
  Asset,
  BusinessUnit,
  ControlDef,
  Department,
  OtLevel,
  Profile,
  RiskCategory,
} from "@/types/domain";

/** All the lookup/reference data the assessment wizards and filters need, fetched once. */
export async function getReferenceData() {
  const supabase = await createClient();

  const [departments, businessUnits, riskCategories, controls, otLevels, assets, profiles] =
    await Promise.all([
      supabase.from("departments").select("*").order("name"),
      supabase.from("business_units").select("*").order("name"),
      supabase.from("risk_categories").select("*").order("sort_order"),
      supabase.from("controls").select("*").eq("is_active", true).order("control_code"),
      supabase.from("ot_levels").select("*").order("sort_order"),
      supabase.from("assets").select("*").eq("is_deleted", false).order("asset_code"),
      supabase.from("profiles").select("*").eq("is_active", true).order("full_name"),
    ]);

  return {
    departments: (departments.data ?? []) as Department[],
    businessUnits: (businessUnits.data ?? []) as BusinessUnit[],
    riskCategories: (riskCategories.data ?? []) as RiskCategory[],
    controls: (controls.data ?? []) as ControlDef[],
    otLevels: (otLevels.data ?? []) as OtLevel[],
    assets: (assets.data ?? []) as Asset[],
    profiles: (profiles.data ?? []) as Profile[],
  };
}

export type ReferenceData = Awaited<ReturnType<typeof getReferenceData>>;
