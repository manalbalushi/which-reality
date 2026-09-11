import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { SectionCard } from "@/components/ui/Card";
import { Badge, RiskRatingBadge, StatusBadge } from "@/components/ui/Badge";
import { Table, Thead, Th, Td, Tr, EmptyState } from "@/components/ui/Table";
import { fmtDate } from "@/lib/format";
import type { VAssessmentInventory } from "@/types/domain";

export const dynamic = "force-dynamic";

const ROLE_STEP: Record<string, string> = {
  risk_manager: "risk_manager_review",
  process_owner: "process_owner_review",
  approver: "approver_review",
};

export default async function ApprovalsPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data } = await supabase.from("v_assessment_inventory").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as VAssessmentInventory[];

  const pendingAny = rows.filter((r) => ["risk_manager_review", "process_owner_review", "approver_review", "pending_approval"].includes(r.status));
  const myQueueStep = ROLE_STEP[profile.role];
  const myQueue = myQueueStep ? pendingAny.filter((r) => r.status === myQueueStep) : profile.role === "administrator" ? pendingAny : [];
  const completed = rows.filter((r) => r.status === "completed" || r.status === "rejected");

  function Row({ a }: { a: VAssessmentInventory }) {
    return (
      <Tr>
        <Td><Link href={`/assessments/${a.id}`} className="font-medium text-brand-600 hover:underline">{a.assessment_code}</Link></Td>
        <Td className="max-w-xs truncate">{a.title}</Td>
        <Td>{a.owner_name ?? "—"}</Td>
        <Td>{fmtDate(a.assessment_date)}</Td>
        <Td><RiskRatingBadge rating={a.highest_risk_rating} score={a.highest_inherent_score} size="sm" /></Td>
        <Td><StatusBadge status={a.status} /></Td>
        <Td><Link href={`/assessments/${a.id}?tab=approvals`} className="text-xs font-medium text-brand-600 hover:underline">Review →</Link></Td>
      </Tr>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Approvals</h1>
        <p className="text-sm text-slate-500">
          Draft → Submitted → Risk Manager Review → Process Owner Review → Approver Review → Approved → Completed
        </p>
      </div>

      <SectionCard
        title="Your Review Queue"
        subtitle={myQueueStep ? `Assessments awaiting your decision at "${myQueueStep.replace(/_/g, " ")}"` : "Your role does not participate in the review chain"}
      >
        {myQueue.length === 0 ? (
          <EmptyState title="Nothing waiting on you" />
        ) : (
          <Table>
            <Thead><tr><Th>ID</Th><Th>Title</Th><Th>Owner</Th><Th>Date</Th><Th>Highest Risk</Th><Th>Status</Th><Th /></tr></Thead>
            <tbody>{myQueue.map((a) => <Row key={a.id} a={a} />)}</tbody>
          </Table>
        )}
      </SectionCard>

      <SectionCard title="All In-Review Assessments">
        {pendingAny.length === 0 ? (
          <EmptyState title="Nothing currently in review" />
        ) : (
          <Table>
            <Thead><tr><Th>ID</Th><Th>Title</Th><Th>Owner</Th><Th>Date</Th><Th>Highest Risk</Th><Th>Status</Th><Th /></tr></Thead>
            <tbody>{pendingAny.map((a) => <Row key={a.id} a={a} />)}</tbody>
          </Table>
        )}
      </SectionCard>

      <SectionCard title="Recently Decided">
        {completed.length === 0 ? (
          <EmptyState title="No completed approvals yet" />
        ) : (
          <Table>
            <Thead><tr><Th>ID</Th><Th>Title</Th><Th>Owner</Th><Th>Completed</Th><Th>Highest Risk</Th><Th>Status</Th><Th /></tr></Thead>
            <tbody>
              {completed.slice(0, 15).map((a) => (
                <Tr key={a.id}>
                  <Td><Link href={`/assessments/${a.id}`} className="font-medium text-brand-600 hover:underline">{a.assessment_code}</Link></Td>
                  <Td className="max-w-xs truncate">{a.title}</Td>
                  <Td>{a.owner_name ?? "—"}</Td>
                  <Td>{fmtDate(a.completion_date)}</Td>
                  <Td><RiskRatingBadge rating={a.highest_risk_rating} score={a.highest_inherent_score} size="sm" /></Td>
                  <Td><StatusBadge status={a.status} /></Td>
                  <Td><Link href={`/assessments/${a.id}`} className="text-xs font-medium text-brand-600 hover:underline">View →</Link></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
}
