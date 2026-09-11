import { createClient } from "@/lib/supabase/server";
import { SectionCard } from "@/components/ui/Card";
import { RiskDistributionChart } from "@/components/charts/RiskDistributionChart";
import { StatusBars } from "@/components/charts/StatusBars";
import { colorForRating } from "@/lib/risk";
import type { VAction, VAssessmentInventory, VRisk } from "@/types/domain";
import { ExportReportsButton } from "@/components/reports/ExportReportsButton";

export const dynamic = "force-dynamic";

function groupCount<T>(rows: T[], key: (r: T) => string | null | undefined) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = key(r) ?? "Unspecified";
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const [{ data: risksRaw }, { data: actionsRaw }, { data: assessmentsRaw }, { data: controlsRaw }] = await Promise.all([
    supabase.from("v_risks").select("*"),
    supabase.from("v_actions").select("*"),
    supabase.from("v_assessment_inventory").select("*"),
    supabase.from("assessment_controls").select("effectiveness"),
  ]);

  const risks = (risksRaw ?? []) as VRisk[];
  const actions = (actionsRaw ?? []) as VAction[];
  const assessments = (assessmentsRaw ?? []) as VAssessmentInventory[];
  const controls = controlsRaw ?? [];

  const ratingCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<string, number>;
  for (const r of risks) if (r.inherent_rating) ratingCounts[r.inherent_rating]++;
  const residualCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<string, number>;
  for (const r of risks) if (r.residual_rating) residualCounts[r.residual_rating]++;

  const byBusiness = groupCount(risks, (r) => r.business_unit_name);
  const byAsset = groupCount(risks.filter((r) => r.asset_name), (r) => r.asset_name);
  const byCategory = groupCount(risks, (r) => r.category_name);
  const actionStatus = groupCount(actions, (a) => a.effective_status);
  const assessmentCompletion = groupCount(assessments, (a) => a.status);
  const controlEffectiveness = groupCount(controls as { effectiveness: string }[], (c) => c.effectiveness);
  const overdueActions = actions.filter((a) => a.effective_status === "overdue").sort((a, b) => b.days_overdue - a.days_overdue);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">Organization-wide OT risk reporting and analytics.</p>
        </div>
        <ExportReportsButton byBusiness={byBusiness} byAsset={byAsset} byCategory={byCategory} overdueActions={overdueActions} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Inherent Risk Distribution">
          <RiskDistributionChart data={(["Critical", "High", "Medium", "Low"] as const).map((r) => ({ rating: r, count: ratingCounts[r], color: colorForRating(r) }))} />
        </SectionCard>
        <SectionCard title="Residual Risk Distribution">
          <RiskDistributionChart data={(["Critical", "High", "Medium", "Low"] as const).map((r) => ({ rating: r, count: residualCounts[r], color: colorForRating(r) }))} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Risk by Business Unit"><StatusBars data={byBusiness} /></SectionCard>
        <SectionCard title="Risk by Asset"><StatusBars data={byAsset.slice(0, 8)} /></SectionCard>
        <SectionCard title="Risk by Category"><StatusBars data={byCategory} /></SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Action Status"><StatusBars data={actionStatus} /></SectionCard>
        <SectionCard title="Assessment Completion"><StatusBars data={assessmentCompletion} /></SectionCard>
        <SectionCard title="Control Effectiveness"><StatusBars data={controlEffectiveness} /></SectionCard>
      </div>

      <SectionCard title="Overdue Actions" subtitle={`${overdueActions.length} action(s) past target date`}>
        <StatusBars data={overdueActions.slice(0, 8).map((a) => ({ label: `${a.action_code} — ${a.description.slice(0, 40)}`, count: a.days_overdue }))} />
      </SectionCard>
    </div>
  );
}
