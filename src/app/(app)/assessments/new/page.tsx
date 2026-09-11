"use client";

import { useTransition } from "react";
import { Zap, ClipboardList } from "lucide-react";
import { createDraftAssessment } from "@/lib/actions/assessments";

export default function NewAssessmentPage() {
  const [pending, startTransition] = useTransition();

  function choose(type: "light" | "full") {
    startTransition(() => {
      createDraftAssessment(type);
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-slate-900">New Risk Assessment</h1>
      <p className="mt-1 text-sm text-slate-500">Choose the type of assessment that fits your scope.</p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <button
          disabled={pending}
          onClick={() => choose("light")}
          className="group flex flex-col items-start rounded-xl border-2 border-slate-200 bg-white p-6 text-left transition hover:border-brand-500 hover:shadow-md disabled:opacity-60"
        >
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Zap size={22} />
          </span>
          <h2 className="text-base font-semibold text-slate-900">Light Risk Assessment</h2>
          <p className="mt-2 text-sm text-slate-500">
            A streamlined, single-session assessment for lower-complexity scope. Capture assessment
            info and risks (with inline scoring and mitigation) in one flow.
          </p>
          <span className="mt-4 text-xs font-medium text-brand-600 group-hover:underline">
            {pending ? "Creating…" : "Start Light Assessment →"}
          </span>
        </button>

        <button
          disabled={pending}
          onClick={() => choose("full")}
          className="group flex flex-col items-start rounded-xl border-2 border-slate-200 bg-white p-6 text-left transition hover:border-brand-500 hover:shadow-md disabled:opacity-60"
        >
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-navy-900 text-white">
            <ClipboardList size={22} />
          </span>
          <h2 className="text-base font-semibold text-slate-900">Full Risk Assessment</h2>
          <p className="mt-2 text-sm text-slate-500">
            A comprehensive, multi-step wizard covering scope, participants, assets, applicability
            &amp; controls, inherent/residual scoring, treatment, actions, evidence and formal approval.
            Save a draft at any step.
          </p>
          <span className="mt-4 text-xs font-medium text-brand-600 group-hover:underline">
            {pending ? "Creating…" : "Start Full Assessment →"}
          </span>
        </button>
      </div>
    </div>
  );
}
