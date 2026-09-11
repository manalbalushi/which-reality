"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { SectionCard, Card } from "@/components/ui/Card";
import { Badge, RiskRatingBadge, StatusBadge } from "@/components/ui/Badge";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { Table, Thead, Th, Td, Tr, EmptyState } from "@/components/ui/Table";
import { ActionsTable } from "@/components/actions/ActionsTable";
import { EvidenceList } from "@/components/evidence/EvidenceList";
import { TrendChart } from "@/components/charts/TrendChart";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { IMPACT_LABELS, LIKELIHOOD_LABELS, ratingForScore, riskReductionPct } from "@/lib/risk";
import { updateRiskScoring, addAction, linkRiskControl, unlinkRiskControl } from "@/lib/actions/assessments";
import type { ReferenceData } from "@/lib/data/reference";
import type {
  ActionItem, ActionPriority, Assessment, AssessmentControl, AuditLog, Evidence, Profile, Risk, TreatmentOption, VAction, VRiskHistory,
} from "@/types/domain";

export function RiskDetail({
  currentProfile, risk, assessment, actions, evidence, auditLogs, history, assessmentControls, riskControlLinks, reference,
}: {
  currentProfile: Profile;
  risk: Risk;
  assessment: Assessment | null;
  actions: ActionItem[];
  evidence: Evidence[];
  auditLogs: AuditLog[];
  history: VRiskHistory[];
  assessmentControls: AssessmentControl[];
  riskControlLinks: string[];
  reference: ReferenceData;
}) {
  const category = reference.riskCategories.find((c) => c.id === risk.category_id);
  const asset = reference.assets.find((a) => a.id === risk.affected_asset_id);
  const owner = reference.profiles.find((p) => p.id === risk.owner_id);
  const canEdit = ["risk_assessor", "process_owner", "risk_manager", "approver", "administrator"].includes(currentProfile.role);

  const vActions: VAction[] = actions.map((a) => {
    const overdue = a.status !== "completed" && a.status !== "cancelled" && new Date(a.target_date) < new Date();
    return {
      ...a,
      risk_code: risk.risk_code,
      risk_title: risk.title,
      assessment_code: assessment?.assessment_code ?? "",
      owner_name: reference.profiles.find((p) => p.id === a.owner_id)?.full_name ?? null,
      department_name: reference.departments.find((d) => d.id === a.department_id)?.name ?? null,
      effective_status: overdue ? "overdue" : a.status,
      days_overdue: overdue ? Math.floor((Date.now() - new Date(a.target_date).getTime()) / 86400000) : 0,
    };
  });

  const trendData = history.map((h) => ({
    label: String(h.assessment_year),
    "Inherent Score": h.inherent_score ?? 0,
    "Residual Score": h.residual_score ?? 0,
  }));

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-mono">{risk.risk_code}</span>
              {assessment && (
                <>
                  ·
                  <Link href={`/assessments/${assessment.id}`} className="text-brand-600 hover:underline">
                    {assessment.assessment_code}
                  </Link>
                </>
              )}
              {category && <Badge>{category.name}</Badge>}
            </div>
            <h1 className="mt-1 text-xl font-semibold text-slate-900">{risk.title}</h1>
            {risk.risk_statement && <p className="mt-1 max-w-2xl text-sm italic text-slate-500">{risk.risk_statement}</p>}
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[11px] text-slate-400">Inherent Risk</p>
              <RiskRatingBadge rating={ratingForScore(risk.inherent_score)} score={risk.inherent_score} size="lg" />
            </div>
            <div className="text-center">
              <p className="text-[11px] text-slate-400">Residual Risk</p>
              <RiskRatingBadge rating={ratingForScore(risk.residual_score)} score={risk.residual_score} size="lg" />
            </div>
            <div className="text-center">
              <p className="text-[11px] text-slate-400">Risk Reduction</p>
              <p className="text-lg font-semibold text-brand-600">
                {riskReductionPct(risk.inherent_score, risk.residual_score) ?? "—"}%
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Risk Details" className="lg:col-span-2">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div><dt className="text-xs text-slate-400">Risk Source</dt><dd className="text-slate-700">{risk.source ?? "—"}</dd></div>
            <div><dt className="text-xs text-slate-400">Affected Asset</dt><dd className="text-slate-700">{asset ? `${asset.asset_code} — ${asset.name}` : "—"}</dd></div>
            <div><dt className="text-xs text-slate-400">Threat</dt><dd className="text-slate-700">{risk.threat ?? "—"}</dd></div>
            <div><dt className="text-xs text-slate-400">Affected Process</dt><dd className="text-slate-700">{risk.affected_process ?? "—"}</dd></div>
            <div><dt className="text-xs text-slate-400">Vulnerability</dt><dd className="text-slate-700">{risk.vulnerability ?? "—"}</dd></div>
            <div><dt className="text-xs text-slate-400">Risk Owner</dt><dd className="text-slate-700">{owner?.full_name ?? "—"}</dd></div>
            <div className="col-span-2"><dt className="text-xs text-slate-400">Consequence</dt><dd className="text-slate-700">{risk.consequence ?? risk.consequence_text ?? "—"}</dd></div>
            <div className="col-span-2"><dt className="text-xs text-slate-400">Existing Controls</dt><dd className="text-slate-700">{risk.existing_controls_text ?? "—"}</dd></div>
          </dl>
        </SectionCard>
        <SectionCard title="Status">
          <dl className="space-y-3 text-sm">
            <div><dt className="text-xs text-slate-400">Status</dt><dd><StatusBadge status={risk.status} /></dd></div>
            <div><dt className="text-xs text-slate-400">Treatment</dt><dd>{risk.treatment ? <Badge color="navy">{risk.treatment}</Badge> : "—"}</dd></div>
            <div><dt className="text-xs text-slate-400">Created</dt><dd className="text-slate-700">{fmtDate(risk.created_at)}</dd></div>
          </dl>
        </SectionCard>
      </div>

      <ScoringPanel risk={risk} canEdit={canEdit} />

      {history.length > 1 && (
        <SectionCard title="Risk History" subtitle="Score trend for this recurring risk across periodic re-assessments">
          <TrendChart data={trendData} series={[{ key: "Inherent Score", label: "Inherent Score" }, { key: "Residual Score", label: "Residual Score" }]} />
        </SectionCard>
      )}

      <SectionCard title="Linked Controls">
        <ControlsLinker risk={risk} assessmentControls={assessmentControls} controls={reference.controls} linkedIds={riskControlLinks} canEdit={canEdit} />
      </SectionCard>

      <SectionCard
        title="Mitigation Actions"
        subtitle={risk.treatment && risk.treatment !== "mitigate" ? `Treatment is "${risk.treatment}" — actions are optional.` : undefined}
        action={canEdit && <AddActionButton risk={risk} profiles={reference.profiles} departments={reference.departments} />}
      >
        <ActionsTable rows={vActions} profiles={reference.profiles} showRisk={false} canEdit={canEdit} />
      </SectionCard>

      <SectionCard title="Evidence">
        <EvidenceList evidence={evidence} profiles={reference.profiles} canManage={canEdit} linkContext={{ risk_id: risk.id, assessment_id: risk.assessment_id }} />
      </SectionCard>

      <SectionCard title="Change History">
        {auditLogs.length === 0 ? (
          <EmptyState title="No changes recorded" />
        ) : (
          <Table>
            <Thead><tr><Th>Date</Th><Th>Action</Th><Th>Field</Th><Th>Old</Th><Th>New</Th></tr></Thead>
            <tbody>
              {auditLogs.map((log) => (
                <Tr key={log.id}>
                  <Td>{fmtDateTime(log.occurred_at)}</Td>
                  <Td><Badge color={log.action === "insert" ? "green" : "blue"}>{log.action}</Badge></Td>
                  <Td className="text-xs">{log.field_changed ?? "—"}</Td>
                  <Td className="max-w-[160px] truncate text-xs text-slate-400">{log.old_value ?? "—"}</Td>
                  <Td className="max-w-[160px] truncate text-xs">{log.new_value ?? "—"}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
}

function ScoringPanel({ risk, canEdit }: { risk: Risk; canEdit: boolean }) {
  const [inhL, setInhL] = useState(risk.inherent_likelihood ?? 0);
  const [inhI, setInhI] = useState(risk.inherent_impact ?? 0);
  const [resL, setResL] = useState(risk.residual_likelihood ?? 0);
  const [resI, setResI] = useState(risk.residual_impact ?? 0);
  const [treatment, setTreatment] = useState<TreatmentOption | "">(risk.treatment ?? "");
  const [acceptJust, setAcceptJust] = useState(risk.acceptance_justification ?? "");
  const [acceptAuth, setAcceptAuth] = useState(risk.acceptance_authority ?? "");
  const [acceptDate, setAcceptDate] = useState(risk.acceptance_date ?? "");
  const [avoidExp, setAvoidExp] = useState(risk.avoidance_explanation ?? "");
  const [transferMethod, setTransferMethod] = useState(risk.transfer_method ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const inhScore = inhL && inhI ? inhL * inhI : null;
  const resScore = resL && resI ? resL * resI : null;

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateRiskScoring(risk.id, risk.assessment_id, {
          inherent_likelihood: inhL || null,
          inherent_impact: inhI || null,
          residual_likelihood: resL || null,
          residual_impact: resI || null,
          treatment: (treatment || null) as TreatmentOption | null,
          acceptance_justification: treatment === "accept" ? acceptJust : null,
          acceptance_authority: treatment === "accept" ? acceptAuth : null,
          acceptance_date: treatment === "accept" ? acceptDate || null : null,
          avoidance_explanation: treatment === "avoid" ? avoidExp : null,
          transfer_method: treatment === "transfer" ? transferMethod : null,
        });
        setSaved(true);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <SectionCard title="Risk Scoring & Treatment" subtitle="Inherent risk, residual risk (after existing controls), and treatment decision">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Inherent Risk</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Likelihood">
              <Select disabled={!canEdit} value={inhL} onChange={(e) => setInhL(Number(e.target.value))}>
                <option value={0}>Select…</option>
                {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v} — {LIKELIHOOD_LABELS[v]}</option>)}
              </Select>
            </Field>
            <Field label="Impact">
              <Select disabled={!canEdit} value={inhI} onChange={(e) => setInhI(Number(e.target.value))}>
                <option value={0}>Select…</option>
                {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v} — {IMPACT_LABELS[v]}</option>)}
              </Select>
            </Field>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-400">Calculated:</span>
            <RiskRatingBadge rating={ratingForScore(inhScore)} score={inhScore} />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Residual Risk (after controls)</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Likelihood">
              <Select disabled={!canEdit} value={resL} onChange={(e) => setResL(Number(e.target.value))}>
                <option value={0}>Select…</option>
                {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v} — {LIKELIHOOD_LABELS[v]}</option>)}
              </Select>
            </Field>
            <Field label="Impact">
              <Select disabled={!canEdit} value={resI} onChange={(e) => setResI(Number(e.target.value))}>
                <option value={0}>Select…</option>
                {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v} — {IMPACT_LABELS[v]}</option>)}
              </Select>
            </Field>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-400">Calculated:</span>
            <RiskRatingBadge rating={ratingForScore(resScore)} score={resScore} />
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Treatment</p>
        <Field label="Treatment Decision">
          <Select disabled={!canEdit} value={treatment} onChange={(e) => setTreatment(e.target.value as TreatmentOption)} className="max-w-xs">
            <option value="">Select…</option>
            <option value="mitigate">Mitigate</option>
            <option value="accept">Accept</option>
            <option value="avoid">Avoid</option>
            <option value="transfer">Transfer</option>
          </Select>
        </Field>

        {treatment === "accept" && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Acceptance Justification" required><Textarea disabled={!canEdit} value={acceptJust} onChange={(e) => setAcceptJust(e.target.value)} /></Field>
            <Field label="Acceptance Authority" required><Input disabled={!canEdit} value={acceptAuth} onChange={(e) => setAcceptAuth(e.target.value)} /></Field>
            <Field label="Acceptance Date"><Input type="date" disabled={!canEdit} value={acceptDate} onChange={(e) => setAcceptDate(e.target.value)} /></Field>
          </div>
        )}
        {treatment === "avoid" && (
          <div className="mt-3">
            <Field label="Avoidance Explanation" required><Textarea disabled={!canEdit} value={avoidExp} onChange={(e) => setAvoidExp(e.target.value)} /></Field>
          </div>
        )}
        {treatment === "transfer" && (
          <div className="mt-3">
            <Field label="Transfer Method" required><Textarea disabled={!canEdit} value={transferMethod} onChange={(e) => setTransferMethod(e.target.value)} /></Field>
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      {canEdit && (
        <div className="mt-4 flex items-center gap-3">
          <Button size="sm" onClick={save} disabled={pending}>{pending ? "Saving…" : "Save Scoring & Treatment"}</Button>
          {saved && <span className="text-xs text-green-600">Saved.</span>}
        </div>
      )}
    </SectionCard>
  );
}

function ControlsLinker({ risk, assessmentControls, controls, linkedIds, canEdit }: {
  risk: Risk; assessmentControls: AssessmentControl[]; controls: ReferenceData["controls"]; linkedIds: string[]; canEdit: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (assessmentControls.length === 0) {
    return <EmptyState title="No controls assessed for this assessment yet" />;
  }

  return (
    <ul className="space-y-1.5">
      {assessmentControls.map((ac) => {
        const def = controls.find((c) => c.id === ac.control_id);
        const linked = linkedIds.includes(ac.id);
        return (
          <li key={ac.id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm">
            <span>
              {def?.name ?? ac.control_id} <Badge className="ml-2">{ac.effectiveness.replace(/_/g, " ")}</Badge>
            </span>
            {canEdit && (
              <button
                onClick={() =>
                  startTransition(() =>
                    linked ? unlinkRiskControl(risk.id, ac.id, risk.assessment_id) : linkRiskControl(risk.id, ac.id, risk.assessment_id)
                  )
                }
                disabled={pending}
                className={`text-xs font-medium ${linked ? "text-red-600" : "text-brand-600"} hover:underline`}
              >
                {linked ? "Unlink" : "Link"}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function AddActionButton({ risk, profiles, departments }: { risk: Risk; profiles: Profile[]; departments: ReferenceData["departments"] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ description: "", owner_id: "", department_id: "", priority: "medium" as ActionPriority, target_date: "" });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await addAction(risk.id, risk.assessment_id, form);
        setOpen(false);
        setForm({ description: "", owner_id: "", department_id: "", priority: "medium", target_date: "" });
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>+ Add Action</Button>
      {open && (
        <Modal open onClose={() => setOpen(false)} title="Add Mitigation Action">
          <div className="space-y-3">
            <Field label="Action Description" required><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <Field label="Action Owner" required>
              <Select value={form.owner_id} onChange={(e) => setForm({ ...form, owner_id: e.target.value })}>
                <option value="">Select…</option>
                {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </Select>
            </Field>
            <Field label="Department">
              <Select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                <option value="">Select…</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as ActionPriority })}>
                <option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
              </Select>
            </Field>
            <Field label="Target Date" required><Input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} /></Field>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={pending || !form.description || !form.owner_id || !form.target_date}>{pending ? "Saving…" : "Add Action"}</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
