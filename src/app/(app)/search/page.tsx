import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { SectionCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Table";

export const dynamic = "force-dynamic";

async function SearchResults({ q }: { q: string }) {
  const supabase = await createClient();
  const needle = `%${q}%`;

  const [{ data: assessments }, { data: risks }, { data: actions }, { data: assets }, { data: participants }] = await Promise.all([
    supabase.from("assessments").select("id, assessment_code, title").or(`assessment_code.ilike.${needle},title.ilike.${needle}`).eq("is_deleted", false).limit(15),
    supabase.from("v_risks").select("*").or(`risk_code.ilike.${needle},risk_title.ilike.${needle}`).limit(15),
    supabase.from("v_actions").select("*").or(`action_code.ilike.${needle},description.ilike.${needle}`).limit(15),
    supabase.from("assets").select("id, asset_code, name").or(`asset_code.ilike.${needle},name.ilike.${needle}`).eq("is_deleted", false).limit(15),
    supabase.from("assessment_participants").select("id, name, assessment_id, role_in_assessment").ilike("name", needle).limit(15),
  ]);

  const totalResults = (assessments?.length ?? 0) + (risks?.length ?? 0) + (actions?.length ?? 0) + (assets?.length ?? 0) + (participants?.length ?? 0);

  if (totalResults === 0) {
    return <EmptyState title={`No results for "${q}"`} subtitle="Try a different assessment ID, risk ID, action ID, asset name or owner." />;
  }

  return (
    <div className="space-y-4">
      {assessments && assessments.length > 0 && (
        <SectionCard title={`Assessments (${assessments.length})`}>
          <ul className="divide-y divide-slate-100">
            {assessments.map((a) => (
              <li key={a.id} className="py-2">
                <Link href={`/assessments/${a.id}`} className="text-sm font-medium text-brand-600 hover:underline">{a.assessment_code} — {a.title}</Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
      {risks && risks.length > 0 && (
        <SectionCard title={`Risks (${risks.length})`}>
          <ul className="divide-y divide-slate-100">
            {risks.map((r) => (
              <li key={r.id} className="py-2">
                <Link href={`/risks/${r.id}`} className="text-sm font-medium text-brand-600 hover:underline">{r.risk_code} — {r.risk_title}</Link>
                <span className="ml-2 text-xs text-slate-400">{r.assessment_code}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
      {actions && actions.length > 0 && (
        <SectionCard title={`Actions (${actions.length})`}>
          <ul className="divide-y divide-slate-100">
            {actions.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2">
                <Link href={`/risks/${a.risk_id}`} className="text-sm font-medium text-brand-600 hover:underline">{a.action_code} — {a.description}</Link>
                <Badge>{a.effective_status}</Badge>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
      {assets && assets.length > 0 && (
        <SectionCard title={`Assets (${assets.length})`}>
          <ul className="divide-y divide-slate-100">
            {assets.map((a) => (
              <li key={a.id} className="py-2 text-sm">
                <span className="font-mono text-xs text-slate-400">{a.asset_code}</span> {a.name}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
      {participants && participants.length > 0 && (
        <SectionCard title={`Participants (${participants.length})`}>
          <ul className="divide-y divide-slate-100">
            {participants.map((p) => (
              <li key={p.id} className="py-2">
                <Link href={`/assessments/${p.assessment_id}?tab=participants`} className="text-sm font-medium text-brand-600 hover:underline">{p.name}</Link>
                <span className="ml-2 text-xs text-slate-400">{p.role_in_assessment}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Search Results</h1>
        <p className="text-sm text-slate-500">{q ? `Results for "${q}"` : "Enter a search term to begin."}</p>
      </div>
      {q ? (
        <Suspense fallback={<p className="text-sm text-slate-400">Searching…</p>}>
          <SearchResults q={q} />
        </Suspense>
      ) : (
        <EmptyState title="Type in the search bar above" />
      )}
    </div>
  );
}
