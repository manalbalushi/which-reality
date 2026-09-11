import { redirect } from "next/navigation";
import { requireProfile, isAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SectionCard } from "@/components/ui/Card";
import { SimpleListEditor } from "@/components/admin/SimpleListEditor";
import { RiskMatrixEditor } from "@/components/admin/RiskMatrixEditor";
import { ControlsEditor } from "@/components/admin/ControlsEditor";
import type { RiskRatingThreshold } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function AdminConfigPage() {
  const profile = await requireProfile();
  if (!isAdmin(profile.role)) redirect("/dashboard");

  const supabase = await createClient();
  const [
    { data: departments },
    { data: businessUnits },
    { data: riskCategories },
    { data: controlCategories },
    { data: thresholds },
    { data: controls },
    { data: otLevels },
  ] = await Promise.all([
    supabase.from("departments").select("*").order("name"),
    supabase.from("business_units").select("*").order("name"),
    supabase.from("risk_categories").select("*").order("sort_order"),
    supabase.from("control_categories").select("*").order("name"),
    supabase.from("risk_rating_thresholds").select("*").order("sort_order"),
    supabase.from("controls").select("*").order("control_code"),
    supabase.from("ot_levels").select("*").order("sort_order"),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Administration — Configuration</h1>
        <p className="text-sm text-slate-500">
          Configure the risk matrix, categories, control catalog, departments and business units used throughout the platform.
        </p>
      </div>

      <SectionCard title="Risk Matrix" subtitle="Configurable 5×5 likelihood × impact scoring thresholds">
        <RiskMatrixEditor thresholds={(thresholds ?? []) as RiskRatingThreshold[]} />
      </SectionCard>

      <SectionCard title="Control Catalog" subtitle="Master list of OT security controls used in the Applicability & Control Assessment step">
        <ControlsEditor controls={controls ?? []} categories={controlCategories ?? []} />
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Risk Categories">
          <SimpleListEditor table="risk_categories" items={riskCategories ?? []} />
        </SectionCard>
        <SectionCard title="Control Categories">
          <SimpleListEditor table="control_categories" items={controlCategories ?? []} />
        </SectionCard>
        <SectionCard title="Departments">
          <SimpleListEditor table="departments" items={departments ?? []} />
        </SectionCard>
        <SectionCard title="Business Units">
          <SimpleListEditor table="business_units" items={businessUnits ?? []} />
        </SectionCard>
      </div>

      <SectionCard title="OT Architecture Levels" subtitle="Purdue-model levels available when scoping an assessment">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(otLevels ?? []).map((l) => (
            <li key={l.id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
              <p className="font-medium text-slate-700">{l.name}</p>
              <p className="text-xs text-slate-400">{l.description}</p>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
