"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, SectionCard } from "@/components/ui/Card";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/Form";
import { Stepper } from "@/components/ui/Stepper";
import { Badge, RiskRatingBadge } from "@/components/ui/Badge";
import { Table, Thead, Th, Td, Tr, EmptyState } from "@/components/ui/Table";
import { IMPACT_LABELS, LIKELIHOOD_LABELS, ratingForScore } from "@/lib/risk";
import { updateAssessmentFields, addRisk, updateRiskScoring, addAction, submitForApproval, validateAssessmentForSubmission } from "@/lib/actions/assessments";
import type { ReferenceData } from "@/lib/data/reference";
import type { ActionItem, ActionPriority, Assessment, Profile, Risk, TreatmentOption } from "@/types/domain";

const STEPS = ["Assessment Information", "Risk Identification", "Review & Submit"];

export function LightWizard({
  profile, assessment, risks, actions, reference,
}: { profile: Profile; assessment: Assessment; risks: Risk[]; actions: ActionItem[]; reference: ReferenceData }) {
  const [step, setStep] = useState(1);
  const router = useRouter();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Card>
        <p className="text-xs font-medium text-brand-600">Light Risk Assessment</p>
        <h1 className="text-lg font-semibold text-slate-900">{assessment.title}</h1>
        <p className="text-xs text-slate-400">{assessment.assessment_code}</p>
        <div className="mt-4">
          <Stepper steps={STEPS} currentStep={step} onStepClick={setStep} />
        </div>
      </Card>

      {step === 1 && <InfoStep assessment={assessment} reference={reference} onNext={() => { router.refresh(); setStep(2); }} />}
      {step === 2 && <RisksStep assessment={assessment} risks={risks} actions={actions} reference={reference} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
      {step === 3 && <ReviewStep assessment={assessment} risks={risks} actions={actions} profile={profile} onBack={() => setStep(2)} />}
    </div>
  );
}

function InfoStep({ assessment, reference, onNext }: { assessment: Assessment; reference: ReferenceData; onNext: () => void }) {
  const [form, setForm] = useState({
    title: assessment.title, asset_id_text: assessment.asset_id_text ?? "", business_unit_id: assessment.business_unit_id ?? "",
    location: assessment.location ?? "", process_owner_id: assessment.process_owner_id ?? "", assessment_owner_id: assessment.assessment_owner_id ?? "",
    assessment_date: assessment.assessment_date ?? "", due_date: assessment.due_date ?? "", reason_for_assessment: assessment.reason_for_assessment ?? "",
    description: assessment.description ?? "", scope_in: assessment.scope_in ?? "", scope_out: assessment.scope_out ?? "", objective: assessment.objective ?? "",
  });
  const [pending, startTransition] = useTransition();

  function saveAndNext() {
    startTransition(async () => {
      await updateAssessmentFields(assessment.id, form);
      onNext();
    });
  }

  return (
    <SectionCard title="Assessment Information">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Assessment Title" required className="sm:col-span-2"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Asset / System"><Input value={form.asset_id_text} onChange={(e) => setForm({ ...form, asset_id_text: e.target.value })} placeholder="e.g. PLC-103" /></Field>
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
        <Field label="In Scope"><Textarea value={form.scope_in} onChange={(e) => setForm({ ...form, scope_in: e.target.value })} /></Field>
        <Field label="Out of Scope"><Textarea value={form.scope_out} onChange={(e) => setForm({ ...form, scope_out: e.target.value })} /></Field>
        <Field label="Assessment Objective" className="sm:col-span-2"><Textarea value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} /></Field>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={saveAndNext} disabled={pending || !form.title}>{pending ? "Saving…" : "Save & Continue →"}</Button>
      </div>
    </SectionCard>
  );
}

function RisksStep({ assessment, risks, actions, reference, onBack, onNext }: {
  assessment: Assessment; risks: Risk[]; actions: ActionItem[]; reference: ReferenceData; onBack: () => void; onNext: () => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <SectionCard title="Risk Identification" subtitle="Add every risk identified for this asset" action={<Button size="sm" onClick={() => setOpen(true)}>+ Add Risk</Button>}>
      {risks.length === 0 ? (
        <EmptyState title="No risks added yet" subtitle="Click “+ Add Risk” to capture your first finding." />
      ) : (
        <Table>
          <Thead><tr><Th>Risk ID</Th><Th>Title</Th><Th>Inherent</Th><Th>Treatment</Th><Th>Actions</Th></tr></Thead>
          <tbody>
            {risks.map((r) => (
              <Tr key={r.id}>
                <Td className="font-medium">{r.risk_code}</Td>
                <Td className="max-w-xs truncate">{r.title}</Td>
                <Td><RiskRatingBadge rating={ratingForScore(r.inherent_score)} score={r.inherent_score} size="sm" /></Td>
                <Td>{r.treatment ? <Badge color="navy">{r.treatment}</Badge> : "—"}</Td>
                <Td className="text-xs text-slate-500">{actions.filter((a) => a.risk_id === r.id).length}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
      <div className="mt-4 flex justify-between">
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={risks.length === 0}>Continue to Review →</Button>
      </div>

      {open && <QuickRiskModal assessmentId={assessment.id} reference={reference} onClose={() => { setOpen(false); router.refresh(); }} />}
    </SectionCard>
  );
}

function QuickRiskModal({ assessmentId, reference, onClose }: { assessmentId: string; reference: ReferenceData; onClose: () => void }) {
  const [form, setForm] = useState({
    title: "", category_id: "", source: "", threat: "", vulnerability: "", consequence: "",
    affected_asset_id: "", existing_controls_text: "", owner_id: "",
  });
  const [likelihood, setLikelihood] = useState(0);
  const [impact, setImpact] = useState(0);
  const [treatment, setTreatment] = useState<TreatmentOption>("mitigate");
  const [mitigation, setMitigation] = useState("");
  const [actionOwner, setActionOwner] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const score = likelihood && impact ? likelihood * impact : null;

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        const riskId = await addRisk(assessmentId, form);
        await updateRiskScoring(riskId, assessmentId, {
          inherent_likelihood: likelihood || null,
          inherent_impact: impact || null,
          residual_likelihood: likelihood || null,
          residual_impact: impact || null,
          treatment,
        });
        if (treatment === "mitigate" && mitigation && actionOwner && targetDate) {
          await addAction(riskId, assessmentId, { description: mitigation, owner_id: actionOwner, priority: "medium" as ActionPriority, target_date: targetDate });
        }
        onClose();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 pt-10">
      <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Add Risk</h2>
        <div className="space-y-3">
          <Field label="Risk Description" required><Textarea value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Risk Category">
              <Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">Select…</option>
                {reference.riskCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Affected Asset">
              <Select value={form.affected_asset_id} onChange={(e) => setForm({ ...form, affected_asset_id: e.target.value })}>
                <option value="">Select…</option>
                {reference.assets.map((a) => <option key={a.id} value={a.id}>{a.asset_code} — {a.name}</option>)}
              </Select>
            </Field>
            <Field label="Risk Source"><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></Field>
            <Field label="Threat"><Input value={form.threat} onChange={(e) => setForm({ ...form, threat: e.target.value })} /></Field>
            <Field label="Vulnerability"><Input value={form.vulnerability} onChange={(e) => setForm({ ...form, vulnerability: e.target.value })} /></Field>
            <Field label="Potential Consequence"><Input value={form.consequence} onChange={(e) => setForm({ ...form, consequence: e.target.value })} /></Field>
          </div>
          <Field label="Existing Controls"><Textarea value={form.existing_controls_text} onChange={(e) => setForm({ ...form, existing_controls_text: e.target.value })} /></Field>

          <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
            <Field label="Likelihood" required>
              <Select value={likelihood} onChange={(e) => setLikelihood(Number(e.target.value))}>
                <option value={0}>Select…</option>
                {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v} — {LIKELIHOOD_LABELS[v]}</option>)}
              </Select>
            </Field>
            <Field label="Impact" required>
              <Select value={impact} onChange={(e) => setImpact(Number(e.target.value))}>
                <option value={0}>Select…</option>
                {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v} — {IMPACT_LABELS[v]}</option>)}
              </Select>
            </Field>
            <div className="col-span-2 flex items-center gap-2">
              <span className="text-xs text-slate-500">Inherent Risk Score:</span>
              <RiskRatingBadge rating={ratingForScore(score)} score={score} />
            </div>
          </div>

          <Field label="Treatment">
            <Select value={treatment} onChange={(e) => setTreatment(e.target.value as TreatmentOption)}>
              <option value="mitigate">Mitigate</option><option value="accept">Accept</option><option value="avoid">Avoid</option><option value="transfer">Transfer</option>
            </Select>
          </Field>

          {treatment === "mitigate" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Mitigation Action" className="sm:col-span-3"><Input value={mitigation} onChange={(e) => setMitigation(e.target.value)} /></Field>
              <Field label="Action Owner">
                <Select value={actionOwner} onChange={(e) => setActionOwner(e.target.value)}>
                  <option value="">Select…</option>
                  {reference.profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </Select>
              </Field>
              <Field label="Target Date" className="sm:col-span-2"><Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} /></Field>
            </div>
          )}
        </div>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={pending || !form.title || !likelihood || !impact}>{pending ? "Saving…" : "Add Risk"}</Button>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ assessment, risks, actions, profile, onBack }: { assessment: Assessment; risks: Risk[]; actions: ActionItem[]; profile: Profile; onBack: () => void }) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);
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
      <div className="space-y-4 text-sm">
        <div>
          <p className="text-xs text-slate-400">Assessment</p>
          <p className="font-medium text-slate-800">{assessment.assessment_code} — {assessment.title}</p>
        </div>
        <div>
          <p className="mb-2 text-xs text-slate-400">Risks ({risks.length})</p>
          <ul className="space-y-1.5">
            {risks.map((r) => (
              <li key={r.id} className="flex items-center gap-2">
                <RiskRatingBadge rating={ratingForScore(r.inherent_score)} score={r.inherent_score} size="sm" />
                <span>{r.title}</span>
                <span className="text-xs text-slate-400">({actions.filter((a) => a.risk_id === r.id).length} action(s))</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="mb-1 text-xs font-semibold text-amber-800">Cannot submit yet:</p>
          <ul className="list-disc space-y-0.5 pl-4 text-xs text-amber-800">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push(`/assessments/${assessment.id}`)}>Save as Draft</Button>
          <Button onClick={handleSubmit} disabled={pending}>{pending ? "Submitting…" : "Submit for Review"}</Button>
        </div>
      </div>
    </SectionCard>
  );
}
