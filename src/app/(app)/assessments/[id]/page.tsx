import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { getReferenceData } from "@/lib/data/reference";
import { getAssessmentBundle } from "@/lib/data/assessmentBundle";
import { AssessmentDetail } from "@/components/assessments/AssessmentDetail";

export const dynamic = "force-dynamic";

const TAB_NAMES = ["Overview", "Scope", "Participants", "Assets", "Risks", "Controls", "Actions", "Evidence", "Approvals", "History"] as const;

export default async function AssessmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const profile = await requireProfile();
  const reference = await getReferenceData();
  const bundle = await getAssessmentBundle(id, reference);
  if (!bundle) notFound();

  return (
    <AssessmentDetail
      currentProfile={profile}
      reference={reference}
      initialTab={TAB_NAMES.find((t) => t.toLowerCase() === tab?.toLowerCase())}
      {...bundle}
    />
  );
}
