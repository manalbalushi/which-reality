"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Form";
import { RiskRatingBadge, Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Td, Tr, EmptyState } from "@/components/ui/Table";
import { ActionsTable } from "@/components/actions/ActionsTable";
import { IMPACT_LABELS, LIKELIHOOD_LABELS, ratingForScore, riskReductionPct } from "@/lib/risk";
import { updateAssessmentFields, setAssessmentOtLevels, updateRiskScoring, validateAssessmentForSubmission, submitForApproval } from "@/lib/actions/assessments";
import type { ReferenceData } from "@/lib/data/reference";
import type { ActionItem, Assessment, Risk, TreatmentOption, VAction } from "@/types/domain";

// ---------------------------------------------------------------------------
export function FullInfoForm({ assessment, reference }: { assessment: Assessment; reference: ReferenceData }) {
  const [form, setForm] = useState({
    title: assessment.title, asset_id_text: assessment.asset_id_text ?? "", business_unit_id: assessment.business_unit_id ?? "",
    location: assessment.location ?? "", process_owner_id: assessment.process_owner_id ?? "", assessment_owner_id: assessment.assessment_owner_id ?? "",
    assessment_date: assessment.assessment_date ?? "", due_date: assessment.due_date ?? "", reason_for_assessment: assessment.reason_for_assessment ?? "",
    description: assessment.description ?? "",
  });
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateAssessmentFields(assessment.id, form);
      setSaved(true);
    });
  }

  return (
    <SectionCard title="Assessment Information">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Assessment Title" required className="sm:col-span-2"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Asset / System"><Input value={form.asset_id_text} onChange={(e) => setForm({ ...form, asset_id_text: e.target.value })} /></Field>
        <Field label="Business / Department">
          <Select value={form.business_unit_id} onChange={(e) => setForm({ ...form, business_unit_id: e.target.value })}>
            <option value="">Select…</option>
            {reference.businessUnits.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
        </Field>
        <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
        <Field label="Process Owner">
          <Select value={form.process_owner_id} onChange={(e) => setForm({ ...form, process_owner_id: e.target.value })}>
            <option value="">Select…</option>
            {reference.profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </Select>
        </Field>
        <Field label="Assessment Owner">
          <Select value={form.assessment_owner_id} onChange={(e) => setForm({ ...form, assessment_owner_id: e.target.value })}>
            <option value="">Select…</option>
            {reference.profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </Select>
        </Field>
        <Field label="Assessment Date"><Input type="date" value={form.assessment_date} onChange={(e) => setForm({ ...form, assessment_date: e.target.value })} /></Field>
        <Field label="Assessment Due Date"><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></Field>
        <Field label="Reason for Assessment" className="sm:col-span-2"><Textarea value={form.reason_for_assessment} onChange={(e) => setForm({ ...form, reason_for_assessment: e.target.value })} /></Field>
        <Field label="Description" className="sm:col-span-2"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      </div>
      <SaveBar pending={pending} saved={saved} onSave={save} />
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
export function FullScopeForm({ assessment, reference, selectedOtLevelIds }: { assessment: Assessment; reference: ReferenceData; selectedOtLevelIds: string[] }) {
  const [form, setForm] = useState({
    objective: assessment.objective ?? "", scope_in: assessment.scope_in ?? "", scope_out: assessment.scope_out ?? "",
    boundary: assessment.boundary ?? "", business_process: assessment.business_process ?? "", ot_environment: assessment.ot_environment ?? "",
    network_zone: assessment.network_zone ?? "", methodology: assessment.methodology ?? "", scope_system: assessment.scope_system ?? "",
    scope_asset: assessment.scope_asset ?? "", scope_technology: assessment.scope_technology ?? "", assessment_criteria: assessment.assessment_criteria ?? "",
    start_date: assessment.start_date ?? "", end_date: assessment.end_date ?? "",
  });
  const [levels, setLevels] = useState<string[]>(selectedOtLevelIds);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateAssessmentFields(assessment.id, form);
      await setAssessmentOtLevels(assessment.id, levels);
      setSaved(true);
    });
  }

  return (
    <SectionCard title="Scope">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Assessment Objective" className="sm:col-span-2"><Textarea value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} /></Field>
        <Field label="In Scope"><Textarea value={form.scope_in} onChange={(e) => setForm({ ...form, scope_in: e.target.value })} /></Field>
        <Field label="Out of Scope"><Textarea value={form.scope_out} onChange={(e) => setForm({ ...form, scope_out: e.target.value })} /></Field>
        <Field label="Assessment Boundary" className="sm:col-span-2"><Textarea value={form.boundary} onChange={(e) => setForm({ ...form, boundary: e.target.value })} /></Field>
        <Field label="Business Process"><Input value={form.business_process} onChange={(e) => setForm({ ...form, business_process: e.target.value })} /></Field>
        <Field label="OT Environment"><Input value={form.ot_environment} onChange={(e) => setForm({ ...form, ot_environment: e.target.value })} /></Field>
        <Field label="Network Zone"><Input value={form.network_zone} onChange={(e) => setForm({ ...form, network_zone: e.target.value })} /></Field>
        <Field label="System"><Input value={form.scope_system} onChange={(e) => setForm({ ...form, scope_system: e.target.value })} /></Field>
        <Field label="Asset"><Input value={form.scope_asset} onChange={(e) => setForm({ ...form, scope_asset: e.target.value })} /></Field>
        <Field label="Technology"><Input value={form.scope_technology} onChange={(e) => setForm({ ...form, scope_technology: e.target.value })} /></Field>
        <Field label="Assessment Criteria"><Input value={form.assessment_criteria} onChange={(e) => setForm({ ...form, assessment_criteria: e.target.value })} /></Field>
        <Field label="Methodology"><Input value={form.methodology} onChange={(e) => setForm({ ...form, methodology: e.target.value })} /></Field>
        <Field label="Assessment Start Date"><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></Field>
        <Field label="Assessment End Date"><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></Field>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">OT Architecture Levels (select all that apply)</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {reference.otLevels.map((lvl) => (
            <label key={lvl.id} className="flex items-center gap-2 rounded-md border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50">
              <input
                type="checkbox"
                checked={levels.includes(lvl.id)}
                onChange={(e) => setLevels(e.target.checked ? [...levels, lvl.id] : levels.filter((id) => id !== lvl.id))}
              />
              {lvl.name}
            </label>
          ))}
        </div>
      </div>
      <SaveBar pending={pending} saved={saved} onSave={save} />
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
export function ScoringStep({ risks }: { risks: Risk[] }) {
  if (risks.length === 0) {
    return <SectionCard title="Inherent / Residual Risk & Treatment"><EmptyState title="Add risks in the previous step first" /></SectionCard>;
  }
  return (
    <div className="space-y-3">
      {risks.map((r) => <RiskScoreRow key={r.id} risk={r} />)}
    </div>
  );
}

function RiskScoreRow({ risk }: { risk: Risk }) {
  const [inhL, setInhL] = useState(risk.inherent_likelihood ?? 0);
  const [inhI, setInhI] = useState(risk.inherent_impact ?? 0);
  const [resL, setResL] = useState(risk.residual_likelihood ?? 0);
  const [resI, setResI] = useState(risk.residual_impact ?? 0);
  const [treatment, setTreatment] = useState<TreatmentOption | "">(risk.treatment ?? "");
  const [acceptJust, setAcceptJust] = useState(risk.acceptance_justification ?? "");
  const [acceptAuth, setAcceptAuth] = useState(risk.acceptance_authority ?? "");
  const [avoidExp, setAvoidExp] = useState(risk.avoidance_explanation ?? "");
  const [transferMethod, setTransferMethod] = useState(risk.transfer_method ?? "");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inhScore = inhL && inhI ? inhL * inhI : null;
  const resScore = resL && resI ? resL * resI : null;

  function save() {
    setSaved(false);
    setError(null);
    startTransition(async () => {
      try {
        await updateRiskScoring(risk.id, risk.assessment_id, {
          inherent_likelihood: inhL || null, inherent_impact: inhI || null,
          residual_likelihood: resL || null, residual_impact: resI || null,
          treatment: (treatment || null) as TreatmentOption | null,
          acceptance_justification: treatment === "accept" ? acceptJust : null,
          acceptance_authority: treatment === "accept" ? acceptAuth : null,
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
    <SectionCard title={risk.title} subtitle={risk.risk_code}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Inherent Likelihood">
            <Select value={inhL} onChange={(e) => setInhL(Number(e.target.value))}>
              <option value={0}>Select…</option>
              {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v} — {LIKELIHOOD_LABELS[v]}</option>)}
            </Select>
          </Field>
          <Field label="Inherent Impact">
            <Select value={inhI} onChange={(e) => setInhI(Number(e.target.value))}>
              <option value={0}>Select…</option>
              {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v} — {IMPACT_LABELS[v]}</option>)}
            </Select>
          </Field>
          <div className="col-span-2"><RiskRatingBadge rating={ratingForScore(inhScore)} score={inhScore} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Residual Likelihood">
            <Select value={resL} onChange={(e) => setResL(Number(e.target.value))}>
              <option value={0}>Select…</option>
              {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v} — {LIKELIHOOD_LABELS[v]}</option>)}
            </Select>
          </Field>
          <Field label="Residual Impact">
            <Select value={resI} onChange={(e) => setResI(Number(e.target.value))}>
              <option value={0}>Select…</option>
              {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v} — {IMPACT_LABELS[v]}</option>)}
            </Select>
          </Field>
          <div className="col-span-2 flex items-center gap-3">
            <RiskRatingBadge rating={ratingForScore(resScore)} score={resScore} />
            {inhScore && resScore && <span className="text-xs text-brand-600">Reduction: {riskReductionPct(inhScore, resScore)}%</span>}
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <Field label="Treatment" className="max-w-xs">
          <Select value={treatment} onChange={(e) => setTreatment(e.target.value as TreatmentOption)}>
            <option value="">Select…</option>
            <option value="mitigate">Mitigate</option><option value="accept">Accept</option><option value="avoid">Avoid</option><option value="transfer">Transfer</option>
          </Select>
        </Field>
        {treatment === "accept" && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="Acceptance Justification" required><Textarea value={acceptJust} onChange={(e) => setAcceptJust(e.target.value)} /></Field>
            <Field label="Acceptance Authority" required><Input value={acceptAuth} onChange={(e) => setAcceptAuth(e.target.value)} /></Field>
          </div>
        )}
        {treatment === "avoid" && <div className="mt-3"><Field label="Avoidance Explanation" required><Textarea value={avoidExp} onChange={(e) => setAvoidExp(e.target.value)} /></Field></div>}
        {treatment === "transfer" && <div className="mt-3"><Field label="Transfer Method" required><Textarea value={transferMethod} onChange={(e) => setTransferMethod(e.target.value)} /></Field></div>}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <SaveBar pending={pending} saved={saved} onSave={save} />
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
export function FullActionsStep({ risks, actions, profiles }: { risks: Risk[]; actions: ActionItem[]; profiles: ReferenceData["profiles"] }) {
  const vActions: VAction[] = actions.map((a) => {
    const risk = risks.find((r) => r.id === a.risk_id);
    const overdue = a.status !== "completed" && a.status !== "cancelled" && new Date(a.target_date) < new Date();
    return {
      ...a, risk_code: risk?.risk_code ?? "", risk_title: risk?.title ?? "", assessment_code: "",
      owner_name: profiles.find((p) => p.id === a.owner_id)?.full_name ?? null, department_name: null,
      effective_status: overdue ? "overdue" : a.status,
      days_overdue: overdue ? Math.floor((Date.now() - new Date(a.target_date).getTime()) / 86400000) : 0,
    };
  });

  const risksNeedingActions = risks.filter((r) => r.treatment === "mitigate" && !actions.some((a) => a.risk_id === r.id));

  return (
    <div className="space-y-4">
      {risksNeedingActions.length > 0 && (
        <SectionCard title="Risks needing a mitigation action" subtitle="Treatment = Mitigate requires at least one action">
          <ul className="space-y-2">
            {risksNeedingActions.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
                <span>{r.risk_code} — {r.title}</span>
                <Badge color="amber">No action yet</Badge>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-400">Open a risk from the Risk Register to add its mitigation action(s).</p>
        </SectionCard>
      )}
      <SectionCard title="All Mitigation Actions">
        <ActionsTable rows={vActions} profiles={profiles} />
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
export function FullReviewStep({ assessment, risks, actions, participants, evidenceCount }: {
  assessment: Assessment; risks: Risk[]; actions: ActionItem[]; participants: number; evidenceCount: number;
}) {
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit() {
    const validationErrors = await validateAssessmentForSubmission(assessment.id);
    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }
    startTransition(() => submitForApproval(assessment.id));
  }

  return (
    <SectionCard title="Review & Submit">
      <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div><dt className="text-xs text-slate-400">Participants</dt><dd className="text-lg font-semibold">{participants}</dd></div>
        <div><dt className="text-xs text-slate-400">Risks</dt><dd className="text-lg font-semibold">{risks.length}</dd></div>
        <div><dt className="text-xs text-slate-400">Actions</dt><dd className="text-lg font-semibold">{actions.length}</dd></div>
        <div><dt className="text-xs text-slate-400">Evidence</dt><dd className="text-lg font-semibold">{evidenceCount}</dd></div>
      </dl>

      <div className="mt-4">
        <Table>
          <Thead><tr><Th>Risk</Th><Th>Inherent</Th><Th>Residual</Th><Th>Treatment</Th></tr></Thead>
          <tbody>
            {risks.map((r) => (
              <Tr key={r.id}>
                <Td>{r.risk_code} — {r.title}</Td>
                <Td><RiskRatingBadge rating={ratingForScore(r.inherent_score)} score={r.inherent_score} size="sm" /></Td>
                <Td><RiskRatingBadge rating={ratingForScore(r.residual_score)} score={r.residual_score} size="sm" /></Td>
                <Td>{r.treatment ? <Badge color="navy">{r.treatment}</Badge> : <Badge color="amber">Pending</Badge>}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>

      {errors.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="mb-1 text-xs font-semibold text-amber-800">This assessment cannot be submitted yet:</p>
          <ul className="list-disc space-y-0.5 pl-4 text-xs text-amber-800">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <button onClick={() => router.push(`/assessments/${assessment.id}`)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          Save as Draft
        </button>
        <button onClick={handleSubmit} disabled={pending} className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-60">
          {pending ? "Submitting…" : "Submit for Review"}
        </button>
      </div>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
function SaveBar({ pending, saved, onSave }: { pending: boolean; saved: boolean; onSave: () => void }) {
  return (
    <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
      <button onClick={onSave} disabled={pending} className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-60">
        {pending ? "Saving…" : "Save"}
      </button>
      {saved && <span className="text-xs text-green-600">Saved.</span>}
    </div>
  );
}
