"use client";

import { clsx } from "clsx";

export function Stepper({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}) {
  return (
    <div className="scrollbar-thin overflow-x-auto pb-1">
      <ol className="flex min-w-max items-center gap-1">
        {steps.map((label, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isDone = step < currentStep;
          return (
            <li key={label} className="flex items-center">
              <button
                type="button"
                disabled={!onStepClick}
                onClick={() => onStepClick?.(step)}
                className={clsx(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition",
                  isActive && "bg-navy-900 text-white",
                  isDone && !isActive && "bg-brand-50 text-brand-600",
                  !isActive && !isDone && "text-slate-400",
                  onStepClick && "cursor-pointer hover:opacity-80"
                )}
              >
                <span
                  className={clsx(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold",
                    isActive && "bg-white text-navy-900",
                    isDone && !isActive && "bg-brand-500 text-white",
                    !isActive && !isDone && "bg-slate-200 text-slate-500"
                  )}
                >
                  {step}
                </span>
                {label}
              </button>
              {step < steps.length && <span className="mx-1 h-px w-4 shrink-0 bg-slate-200" />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-brand-500 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
