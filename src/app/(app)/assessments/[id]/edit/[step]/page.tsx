import { notFound, redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { getReferenceData } from "@/lib/data/reference";
import { getAssessmentBundle } from "@/lib/data/assessmentBundle";
import { FullWizardShell, WIZARD_STEPS } from "@/components/assessments/FullWizardShell";
import { FullInfoForm, FullScopeForm, ScoringStep, FullActionsStep, FullReviewStep } from "@/components/assessments/FullWizardSteps";
import { ParticipantsPanel, AssetsPanel, RisksPanel, ControlsPanel } from "@/components/assessments/AssessmentDetail";
import { EvidenceList } from "@/components/evidence/EvidenceList";

export const dynamic = "force-dynamic";

export default async function WizardStepPage({ params }: { params: Promise<{ id: string; step: string }> }) {
  const { id, step } = await params;
  await requireProfile();

  if (!WIZARD_STEPS.some((s) => s.slug === step)) notFound();

  const reference = await getReferenceData();
  const bundle = await getAssessmentBundle(id, reference);
  if (!bundle) notFound();
  if (bundle.assessment.type !== "light" && bundle.assessment.status !== "draft" && bundle.assessment.status !== "in_progress" && bundle.assessment.status !== "rejected") {
    redirect(`/assessments/${id}`);
  }
  if (bundle.assessment.type === "light") redirect(`/assessments/${id}/light`);

  const { assessment, risks, actions, participants, linkedAssets, assessmentControls, riskControlLinks, evidence, selectedOtLevelIds } = bundle;

  const categoryName = (catId: string | null) => reference.riskCategories.find((c) => c.id === catId)?.name ?? "—";
  const assetName = (assetId: string | null) => reference.assets.find((a) => a.id === assetId)?.name ?? "—";
  const profileName = (pId: string | null) => reference.profiles.find((p) => p.id === pId)?.full_name ?? "—";
  const controlDef = (cId: string) => reference.controls.find((c) => c.id === cId);

  return (
    <FullWizardShell assessment={assessment} slug={step}>
      {step === "info" && <FullInfoForm assessment={assessment} reference={reference} />}
      {step === "scope" && <FullScopeForm assessment={assessment} reference={reference} selectedOtLevelIds={selectedOtLevelIds} />}
      {step === "participants" && (
        <ParticipantsPanel assessmentId={id} participants={participants} evidence={evidence} canEdit profiles={reference.profiles} />
      )}
      {step === "assets" && <AssetsPanel assessmentId={id} linkedAssets={linkedAssets} allAssets={reference.assets} canEdit />}
      {step === "risks" && (
        <RisksPanel assessment={assessment} risks={risks} reference={reference} canEdit categoryName={categoryName} assetName={assetName} profileName={profileName} />
      )}
      {step === "controls" && (
        <ControlsPanel
          assessmentId={id}
          assessmentControls={assessmentControls}
          risks={risks}
          riskControlLinks={riskControlLinks}
          controlDef={controlDef}
          profileName={profileName}
          controls={reference.controls}
          profiles={reference.profiles}
        />
      )}
      {step === "scoring" && <ScoringStep risks={risks} />}
      {step === "actions" && <FullActionsStep risks={risks} actions={actions} profiles={reference.profiles} />}
      {step === "evidence" && <EvidenceList evidence={evidence} profiles={reference.profiles} linkContext={{ assessment_id: id }} />}
      {step === "review" && (
        <FullReviewStep assessment={assessment} risks={risks} actions={actions} participants={participants.length} evidenceCount={evidence.length} />
      )}
    </FullWizardShell>
  );
}
