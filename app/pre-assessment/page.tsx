"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import WizardProgress from "@/components/WizardProgress";
import QuestionList from "@/components/QuestionList";
import RiskResult from "@/components/RiskResult";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { authApiClient } from "@/lib/api";
import { KNOWLEDGE_BASE, GroupKey, runCDSS, CDSSResult } from "@/lib/cdss";

const STEP_GROUPS: GroupKey[] = ["groupA", "groupB", "groupC", "groupD"];

export default function PreAssessmentPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<CDSSResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authApiClient.getCurrentUser();
        if (!user || user.role !== "patient") {
          router.replace("/login");
          return;
        }
        setChecking(false);
      } catch {
        router.replace("/login");
      }
    };
    loadUser();
  }, [router]);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function goNext() {
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goPrev() {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit() {
    const r = runCDSS([...selectedIds]);
    setSubmitting(true);
    setError("");
    authApiClient
      .createPatientAssessment({
        ...r,
        tier: {
          tier: r.tier.tier,
          label: r.tier.label,
          icon: r.tier.icon,
          summary: r.tier.summary,
          recommendation: r.tier.recommendation,
          urgency: r.tier.urgency,
        },
      })
      .then(() => {
        setResult(r);
        setStep(5);
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((submitError) => {
        setError(
          submitError instanceof Error
            ? submitError.message || "Unable to submit assessment. Please try again."
            : "Unable to submit assessment. Please try again.",
        );
      })
      .finally(() => setSubmitting(false));
  }

  if (checking) return null;

  const groupKey = STEP_GROUPS[step - 1];
  const group = groupKey ? KNOWLEDGE_BASE[groupKey] : null;

  return (
    <DashboardShell
      active="/pre-assessment"
      title="Prostate Cancer Pre-Assessment"
      subtitle="Answer honestly — your responses will be reviewed by a clinician before your consultation"
    >
      <div className="mx-auto max-w-[860px]">
        <WizardProgress currentStep={step} />

        {step < 5 && (
          <Alert
            type="info"
            message="Instructions: Select all symptoms or conditions that apply to you. If a statement does not apply, leave it unchecked. There are no right or wrong answers — answer based on your experience over the past 4 weeks."
          />
        )}

        {error && <Alert type="error" message={error} />}

        {group && (
          <div className="rounded-card-lg border border-border bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-[18px]">
              <h3 className="text-[0.95rem] font-bold text-navy">
                {group.icon} Group {String.fromCharCode(64 + step)} —{" "}
                {group.label}
              </h3>
              <span className="text-[0.75rem] text-ink-muted">
                Weight: {group.weight} points each
              </span>
            </div>
            <div className="p-6">
              <p className="mb-5 text-[0.85rem] text-ink-muted">
                {step === 1
                  ? "These questions relate to your urinary function over the past 4 weeks. Select all that apply."
                  : step === 2
                    ? "These questions relate to general body symptoms. Select all that apply."
                    : step === 3
                      ? "These questions relate to pain or discomfort you may be experiencing. Select all that apply."
                      : "These questions help identify personal and family risk factors. Select all that apply."}
              </p>
              <QuestionList
                questions={group.questions}
                selectedIds={selectedIds}
                onToggle={toggle}
              />
              <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
                {step > 1 ? (
                  <Button variant="secondary" onClick={goPrev}>
                    ← Back
                  </Button>
                ) : (
                  <span className="text-[0.78rem] text-ink-muted">
                    Step 1 of 4
                  </span>
                )}
                {step < 4 ? (
                  <Button variant="primary" onClick={goNext}>
                    Next:{" "}
                    {step === 1
                      ? "Systemic Symptoms"
                      : step === 2
                        ? "Pain Indicators"
                        : "Risk Factors"}{" "}
                    →
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={submit}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit & View Results →"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 5 && result && <RiskResult result={result} />}
      </div>
    </DashboardShell>
  );
}
