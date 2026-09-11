"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Stepper } from "@/components/ui/Stepper";
import type { Assessment } from "@/types/domain";

export const WIZARD_STEPS: { slug: string; label: string }[] = [
  { slug: "info", label: "Assessment Information" },
  { slug: "scope", label: "Scope" },
  { slug: "participants", label: "Participants" },
  { slug: "assets", label: "Assets" },
  { slug: "risks", label: "Risk Identification" },
  { slug: "controls", label: "Applicability & Controls" },
  { slug: "scoring", label: "Inherent / Residual Risk & Treatment" },
  { slug: "actions", label: "Mitigation Actions" },
  { slug: "evidence", label: "Evidence" },
  { slug: "review", label: "Review & Submit" },
];

export function FullWizardShell({ assessment, slug, children }: { assessment: Assessment; slug: string; children: React.ReactNode }) {
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.slug === slug);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Card>
        <p className="text-xs font-medium text-brand-600">Full Risk Assessment — Step {currentIndex + 1} of {WIZARD_STEPS.length}</p>
        <h1 className="text-lg font-semibold text-slate-900">{assessment.title}</h1>
        <p className="text-xs text-slate-400">{assessment.assessment_code} · Draft auto-saves as you go — safe to leave and resume anytime.</p>
        <div className="mt-4">
          <Stepper
            steps={WIZARD_STEPS.map((s) => s.label)}
            currentStep={currentIndex + 1}
            onStepClick={undefined}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {WIZARD_STEPS.map((s, i) => (
            <Link
              key={s.slug}
              href={`/assessments/${assessment.id}/edit/${s.slug}`}
              className={`rounded px-1.5 py-0.5 text-[10px] ${i === currentIndex ? "text-brand-600 underline" : "text-slate-300 hover:text-slate-500"}`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      </Card>
      {children}
      <WizardNav assessmentId={assessment.id} slug={slug} />
    </div>
  );
}

function WizardNav({ assessmentId, slug }: { assessmentId: string; slug: string }) {
  const idx = WIZARD_STEPS.findIndex((s) => s.slug === slug);
  const prev = WIZARD_STEPS[idx - 1];
  const next = WIZARD_STEPS[idx + 1];
  return (
    <div className="flex items-center justify-between pb-8">
      {prev ? (
        <Link href={`/assessments/${assessmentId}/edit/${prev.slug}`} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          ← {prev.label}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={`/assessments/${assessmentId}/edit/${next.slug}`} className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800">
          {next.label} →
        </Link>
      ) : (
        <Link href={`/assessments/${assessmentId}`} className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800">
          Go to Assessment →
        </Link>
      )}
    </div>
  );
}
