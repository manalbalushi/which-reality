"use client";

import { useState, useTransition } from "react";
import { Button, Input } from "@/components/ui/Form";
import { updateRiskThreshold } from "@/lib/actions/admin";
import type { RiskRatingThreshold } from "@/types/domain";

export function RiskMatrixEditor({ thresholds }: { thresholds: RiskRatingThreshold[] }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Risk Score = Likelihood (1–5) × Impact (1–5). Adjust the score ranges that map to each rating; changes apply
        immediately everywhere risk ratings are calculated.
      </p>
      <table className="w-full text-sm">
        <thead className="text-xs text-slate-400">
          <tr><th className="pb-2 text-left">Rating</th><th className="pb-2 text-left">Min Score</th><th className="pb-2 text-left">Max Score</th><th className="pb-2 text-left">Color</th><th /></tr>
        </thead>
        <tbody>
          {thresholds.sort((a, b) => a.sort_order - b.sort_order).map((t) => <Row key={t.id} t={t} />)}
        </tbody>
      </table>
    </div>
  );
}

function Row({ t }: { t: RiskRatingThreshold }) {
  const [min, setMin] = useState(t.min_score);
  const [max, setMax] = useState(t.max_score);
  const [color, setColor] = useState(t.color);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await updateRiskThreshold(t.id, { min_score: min, max_score: max, color });
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <tr className="border-t border-slate-100">
      <td className="py-2 font-medium" style={{ color }}>{t.rating}</td>
      <td className="py-2"><Input type="number" min={1} max={25} value={min} onChange={(e) => setMin(Number(e.target.value))} className="w-20" /></td>
      <td className="py-2"><Input type="number" min={1} max={25} value={max} onChange={(e) => setMax(Number(e.target.value))} className="w-20" /></td>
      <td className="py-2"><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-12 rounded" /></td>
      <td className="py-2">
        <Button size="sm" variant="secondary" onClick={save} disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        {error && <p className="text-[11px] text-red-600">{error}</p>}
      </td>
    </tr>
  );
}
