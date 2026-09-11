import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/StatCard";
import { SectionCard } from "@/components/ui/Card";
import { RiskRatingBadge, StatusBadge } from "@/components/ui/Badge";
import { Table, Thead, Th, Td, Tr, EmptyState } from "@/components/ui/Table";
import { RiskDistributionChart } from "@/components/charts/RiskDistributionChart";
import { StatusBars } from "@/components/charts/StatusBars";
import { TrendChart } from "@/components/charts/TrendChart";
import { fmtDate } from "@/lib/format";
import { colorForRating } from "@/lib/risk";
import type { VAction, VAssessmentInventory, VRisk } from "@/types/domain";
import { ClipboardList, ShieldAlert, ListChecks, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: assessmentsRaw }, { data: risksRaw }, { data: actionsRaw }] = await Promise.all([
    supabase.from("v_assessment_inventory").select("*"),
    supabase.from("v_risks").select("*"),
    supabase.from("v_actions").select("*"),
  ]);

  const assessments = (assessmentsRaw ?? []) as VAssessmentInventory[];
  const risks = (risksRaw ?? []) as VRisk[];
  const actions = (actionsRaw ?? []) as VAction[];

  const assessmentKpis = {
    total: assessments.length,
    completed: assessments.filter((a) => a.status === "completed" || a.status === "approved").length,
    inProgress: assessments.filter((a) => !["completed", "approved", "archived", "rejected"].includes(a.status)).length,
    overdue: assessments.filter((a) => a.is_overdue).length,
  };

  const ratingCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<string, number>;
  for (const r of risks) if (r.inherent_rating) ratingCounts[r.inherent_rating] = (ratingCounts[r.inherent_rating] ?? 0) + 1;

  const actionKpis = {
    total: actions.length,
    completed: actions.filter((a) => a.effective_status === "completed").length,
    inProgress: actions.filter((a) => a.effective_status === "in_progress").length,
    overdue: actions.filter((a) => a.effective_status === "overdue").length,
    open: actions.filter((a) => a.effective_status === "open").length,
  };

  const distributionData = (["Critical", "High", "Medium", "Low"] as const).map((rating) => ({
    rating,
    count: ratingCounts[rating] ?? 0,
    color: colorForRating(rating),
  }));

  const assessmentStatusData = Object.entries(
    assessments.reduce<Record<string, number>>((acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([label, count]) => ({ label: label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), count }));

  const actionStatusData = Object.entries(
    actions.reduce<Record<string, number>>((acc, a) => {
      acc[a.effective_status] = (acc[a.effective_status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([label, count]) => ({ label: label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), count }));

  // Risk trend: average inherent vs residual score per assessment month
  const monthBuckets = new Map<string, { inherent: number[]; residual: number[] }>();
  for (const r of risks) {
    if (!r.created_at) continue;
    const d = new Date(r.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthBuckets.has(key)) monthBuckets.set(key, { inherent: [], residual: [] });
    const b = monthBuckets.get(key)!;
    if (r.inherent_score != null) b.inherent.push(r.inherent_score);
    if (r.residual_score != null) b.residual.push(r.residual_score);
  }
  const trendData = [...monthBuckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-9)
    .map(([key, b]) => ({
      label: key,
      "Avg Inherent Score": b.inherent.length ? Math.round((b.inherent.reduce((s, v) => s + v, 0) / b.inherent.length) * 10) / 10 : 0,
      "Avg Residual Score": b.residual.length ? Math.round((b.residual.reduce((s, v) => s + v, 0) / b.residual.length) * 10) / 10 : 0,
    }));

  const topRisks = [...risks]
    .filter((r) => r.inherent_score != null)
    .sort((a, b) => (b.inherent_score ?? 0) - (a.inherent_score ?? 0))
    .slice(0, 10);

  const topOverdueActions = [...actions]
    .filter((a) => a.effective_status === "overdue")
    .sort((a, b) => b.days_overdue - a.days_overdue)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">OT Risk Management Dashboard</h1>
        <p className="text-sm text-slate-500">Live view of OT cybersecurity risk exposure across all assessments.</p>
      </div>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Assessments</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Assessments" value={assessmentKpis.total} icon={ClipboardList} href="/assessments" />
          <StatCard label="Completed" value={assessmentKpis.completed} icon={ClipboardList} tone="good" href="/assessments?status=completed" />
          <StatCard label="In Progress" value={assessmentKpis.inProgress} icon={ClipboardList} href="/assessments" />
          <StatCard label="Overdue" value={assessmentKpis.overdue} icon={AlertTriangle} tone="critical" href="/assessments" />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Risks</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <StatCard label="Total Risks" value={risks.length} icon={ShieldAlert} href="/risks" />
          <StatCard label="Critical" value={ratingCounts.Critical ?? 0} tone="critical" href="/risks?rating=Critical" />
          <StatCard label="High" value={ratingCounts.High ?? 0} tone="high" href="/risks?rating=High" />
          <StatCard label="Medium" value={ratingCounts.Medium ?? 0} tone="medium" href="/risks?rating=Medium" />
          <StatCard label="Low" value={ratingCounts.Low ?? 0} tone="low" href="/risks?rating=Low" />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Mitigation Actions</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <StatCard label="Total Actions" value={actionKpis.total} icon={ListChecks} href="/actions" />
          <StatCard label="Completed" value={actionKpis.completed} tone="good" href="/actions?status=completed" />
          <StatCard label="In Progress" value={actionKpis.inProgress} href="/actions?status=in_progress" />
          <StatCard label="Overdue" value={actionKpis.overdue} tone="critical" href="/actions?status=overdue" />
          <StatCard label="Open" value={actionKpis.open} href="/actions?status=open" />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Risk Distribution" subtitle="Inherent risk rating across all assessments" className="lg:col-span-1">
          <RiskDistributionChart data={distributionData} />
        </SectionCard>
        <SectionCard title="Risk Trend Over Time" subtitle="Average inherent vs. residual score by month identified" className="lg:col-span-2">
          {trendData.length > 1 ? (
            <TrendChart data={trendData} series={[{ key: "Avg Inherent Score", label: "Avg Inherent Score" }, { key: "Avg Residual Score", label: "Avg Residual Score" }]} />
          ) : (
            <EmptyState title="Not enough data yet" subtitle="Trend appears once risks span multiple months." />
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Assessment Status" subtitle="Draft, in progress, review, completed">
          <StatusBars data={assessmentStatusData} />
        </SectionCard>
        <SectionCard title="Action Status" subtitle="Completed, in progress, overdue, open">
          <StatusBars data={actionStatusData} />
        </SectionCard>
      </div>

      <SectionCard title="Top 10 Risks" subtitle="Highest inherent risk score across the organization" action={<Link href="/risks" className="text-xs font-medium text-brand-600 hover:underline">View Risk Register →</Link>}>
        {topRisks.length === 0 ? (
          <EmptyState title="No risks recorded yet" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Risk ID</Th>
                <Th>Title</Th>
                <Th>Asset</Th>
                <Th>Inherent</Th>
                <Th>Residual</Th>
                <Th>Owner</Th>
                <Th>Status</Th>
              </tr>
            </Thead>
            <tbody>
              {topRisks.map((r) => (
                <Tr key={r.id}>
                  <Td>
                    <Link href={`/risks/${r.id}`} className="font-medium text-brand-600 hover:underline">
                      {r.risk_code}
                    </Link>
                  </Td>
                  <Td className="max-w-xs truncate">{r.risk_title}</Td>
                  <Td>{r.asset_name ?? "—"}</Td>
                  <Td>
                    <RiskRatingBadge rating={r.inherent_rating} score={r.inherent_score} size="sm" />
                  </Td>
                  <Td>
                    <RiskRatingBadge rating={r.residual_rating} score={r.residual_score} size="sm" />
                  </Td>
                  <Td>{r.owner_name ?? "—"}</Td>
                  <Td>
                    <StatusBadge status={r.status} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </SectionCard>

      <SectionCard title="Top Overdue Actions" subtitle="Mitigation actions requiring immediate management attention" action={<Link href="/actions?status=overdue" className="text-xs font-medium text-brand-600 hover:underline">View Action Register →</Link>}>
        {topOverdueActions.length === 0 ? (
          <EmptyState title="No overdue actions" subtitle="All mitigation actions are on track." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Action ID</Th>
                <Th>Description</Th>
                <Th>Risk</Th>
                <Th>Owner</Th>
                <Th>Due Date</Th>
                <Th>Days Overdue</Th>
              </tr>
            </Thead>
            <tbody>
              {topOverdueActions.map((a) => (
                <Tr key={a.id}>
                  <Td>
                    <Link href={`/actions?highlight=${a.id}`} className="font-medium text-brand-600 hover:underline">
                      {a.action_code}
                    </Link>
                  </Td>
                  <Td className="max-w-sm truncate">{a.description}</Td>
                  <Td>
                    <Link href={`/risks/${a.risk_id}`} className="hover:underline">
                      {a.risk_code}
                    </Link>
                  </Td>
                  <Td>{a.owner_name ?? "—"}</Td>
                  <Td>{fmtDate(a.target_date)}</Td>
                  <Td className="font-semibold text-red-600">{a.days_overdue}d</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
}
