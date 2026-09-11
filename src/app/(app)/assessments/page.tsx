import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SectionCard } from "@/components/ui/Card";
import { StatusBadge, RiskRatingBadge, Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Td, Tr, EmptyState } from "@/components/ui/Table";
import { fmtDate } from "@/lib/format";
import type { VAssessmentInventory } from "@/types/domain";
import { ExportAssessmentInventoryButton } from "@/components/assessments/ExportInventoryButton";

export const dynamic = "force-dynamic";

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; q?: string }>;
}) {
  const { status, type, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("v_assessment_inventory").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (type) query = query.eq("type", type);
  const { data } = await query;

  let rows = (data ?? []) as VAssessmentInventory[];
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.assessment_code.toLowerCase().includes(needle) ||
        r.title.toLowerCase().includes(needle) ||
        (r.asset_name ?? "").toLowerCase().includes(needle)
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Assessment Inventory</h1>
          <p className="text-sm text-slate-500">All completed and historical OT risk assessments.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportAssessmentInventoryButton rows={rows} />
          <Link href="/assessments/new" className="flex items-center gap-1.5 rounded-lg bg-navy-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-navy-800">
            <Plus size={16} />
            New Risk Assessment
          </Link>
        </div>
      </div>

      <form className="flex flex-wrap items-center gap-2" action="/assessments">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by title, code or asset…"
          className="w-64 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
        />
        <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">All statuses</option>
          {["draft", "in_progress", "pending_approval", "risk_manager_review", "process_owner_review", "approver_review", "completed", "rejected", "archived"].map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={type ?? ""} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          <option value="">All types</option>
          <option value="light">Light</option>
          <option value="full">Full</option>
        </select>
        <button type="submit" className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">
          Filter
        </button>
        {(status || type || q) && (
          <Link href="/assessments" className="text-xs text-slate-400 hover:underline">
            Clear
          </Link>
        )}
      </form>

      <SectionCard title={`${rows.length} assessment${rows.length === 1 ? "" : "s"}`}>
        {rows.length === 0 ? (
          <EmptyState title="No assessments found" subtitle="Adjust your filters or create a new assessment." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>ID</Th>
                <Th>Title</Th>
                <Th>Type</Th>
                <Th>Asset</Th>
                <Th>Business</Th>
                <Th>Owner</Th>
                <Th>Date</Th>
                <Th>Risks</Th>
                <Th>Highest Risk</Th>
                <Th>Status</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.map((a) => (
                <Tr key={a.id}>
                  <Td>
                    <Link href={`/assessments/${a.id}`} className="font-medium text-brand-600 hover:underline">
                      {a.assessment_code}
                    </Link>
                  </Td>
                  <Td className="max-w-xs truncate">{a.title}</Td>
                  <Td>
                    <Badge color={a.type === "full" ? "navy" : "blue"}>{a.type === "full" ? "Full" : "Light"}</Badge>
                  </Td>
                  <Td>{a.asset_name ?? "—"}</Td>
                  <Td>{a.business_unit_name ?? "—"}</Td>
                  <Td>{a.owner_name ?? "—"}</Td>
                  <Td>{fmtDate(a.assessment_date)}</Td>
                  <Td>{a.risk_count}</Td>
                  <Td>
                    <RiskRatingBadge rating={a.highest_risk_rating} score={a.highest_inherent_score} size="sm" />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={a.status} />
                      {a.is_overdue && <Badge color="red">Overdue</Badge>}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
}
