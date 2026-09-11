import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionCard } from "@/components/ui/Card";
import { RiskRatingBadge, StatusBadge, Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Td, Tr, EmptyState } from "@/components/ui/Table";
import { fmtDate } from "@/lib/format";
import type { VRisk } from "@/types/domain";
import { ExportRiskRegisterButton } from "@/components/risks/ExportRiskRegisterButton";

export const dynamic = "force-dynamic";

export default async function RiskRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ rating?: string; category?: string; treatment?: string; q?: string }>;
}) {
  const { rating, category, treatment, q } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase.from("v_risks").select("*").order("inherent_score", { ascending: false, nullsFirst: false });
  let rows = (data ?? []) as VRisk[];

  if (rating) rows = rows.filter((r) => r.inherent_rating === rating);
  if (category) rows = rows.filter((r) => r.category_name === category);
  if (treatment) rows = rows.filter((r) => r.treatment === treatment);
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.risk_code.toLowerCase().includes(needle) ||
        r.risk_title.toLowerCase().includes(needle) ||
        r.assessment_code.toLowerCase().includes(needle) ||
        (r.asset_name ?? "").toLowerCase().includes(needle)
    );
  }

  const categories = [...new Set((data ?? []).map((r) => r.category_name).filter(Boolean))] as string[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Risk Register</h1>
          <p className="text-sm text-slate-500">All risks across every OT risk assessment — the single source of truth.</p>
        </div>
        <ExportRiskRegisterButton rows={rows} />
      </div>

      <form className="flex flex-wrap items-center gap-2" action="/risks">
        <input name="q" defaultValue={q} placeholder="Search by risk ID, title, asset…" className="w-64 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none" />
        <select name="rating" defaultValue={rating ?? ""} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">All ratings</option>
          {["Critical", "High", "Medium", "Low"].map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select name="category" defaultValue={category ?? ""} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="treatment" defaultValue={treatment ?? ""} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">All treatments</option>
          {["mitigate", "accept", "avoid", "transfer"].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button type="submit" className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">Filter</button>
        {(rating || category || treatment || q) && <Link href="/risks" className="text-xs text-slate-400 hover:underline">Clear</Link>}
      </form>

      <SectionCard title={`${rows.length} risk${rows.length === 1 ? "" : "s"}`}>
        {rows.length === 0 ? (
          <EmptyState title="No risks found" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Risk ID</Th><Th>Assessment</Th><Th>Title</Th><Th>Asset</Th><Th>Category</Th>
                <Th>Inherent</Th><Th>Residual</Th><Th>Treatment</Th><Th>Owner</Th><Th>Status</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.map((r) => (
                <Tr key={r.id}>
                  <Td><Link href={`/risks/${r.id}`} className="font-medium text-brand-600 hover:underline">{r.risk_code}</Link></Td>
                  <Td><Link href={`/assessments/${r.assessment_id}`} className="text-xs text-slate-500 hover:underline">{r.assessment_code}</Link></Td>
                  <Td className="max-w-xs truncate">{r.risk_title}</Td>
                  <Td>{r.asset_name ?? "—"}</Td>
                  <Td>{r.category_name ? <Badge>{r.category_name}</Badge> : "—"}</Td>
                  <Td><RiskRatingBadge rating={r.inherent_rating} score={r.inherent_score} size="sm" /></Td>
                  <Td><RiskRatingBadge rating={r.residual_rating} score={r.residual_score} size="sm" /></Td>
                  <Td>{r.treatment ? <Badge color="navy">{r.treatment}</Badge> : "—"}</Td>
                  <Td>{r.owner_name ?? "—"}</Td>
                  <Td><StatusBadge status={r.status} /></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
}
