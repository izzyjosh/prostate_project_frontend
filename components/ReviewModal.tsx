"use client";

import { useEffect, useState } from "react";
import Button from "./Button";
import { FormSelect } from "./FormField";
import { GroupKey, KNOWLEDGE_BASE } from "@/lib/cdss";
import {
  authApiClient,
  ClinicianAssessmentResponse,
  getApiErrorMessage,
} from "@/lib/api";
import Alert from "./Alert";

const DIAGNOSIS_OPTIONS = [
  "Further investigation required (PSA + DRE)",
  "Benign Prostatic Hyperplasia (BPH) — suspected",
  "Prostatitis — suspected",
  "Prostate Cancer — high suspicion (urgent imaging + biopsy)",
  "Prostate Cancer — confirmed (pending staging)",
  "Low risk — routine monitoring recommended",
];

function defaultFollowup() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

export default function ReviewModal({
  record,
  onClose,
  onSubmitted,
}: {
  record: ClinicianAssessmentResponse;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [diagnosis, setDiagnosis] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [notes, setNotes] = useState("");
  const [followup, setFollowup] = useState(defaultFollowup());
  const [urgency, setUrgency] = useState<"Routine" | "Priority" | "Urgent">(
    "Routine",
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit() {
    if (!diagnosis) {
      setError("Please select a clinical impression.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await authApiClient.reviewClinicianAssessment(record.id, {
        diagnosis,
        recommendation: recommendation.trim() || undefined,
        notes: notes.trim() || undefined,
        followupDate: followup,
        urgency,
      });
      onSubmitted();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  const groupEntries = Object.entries(KNOWLEDGE_BASE) as [
    GroupKey,
    (typeof KNOWLEDGE_BASE)[GroupKey],
  ][];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-navy/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-[90%] max-w-[620px] overflow-y-auto rounded-card-lg bg-white p-8 shadow-card-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1.5 font-display text-[1.3rem] text-navy">
          Review Pre-Assessment
        </h2>
        <p className="mb-[22px] text-[0.82rem] text-ink-muted">
          Patient: <strong>{record.patientName}</strong> — Review their
          submitted symptoms and issue a clinical response.
        </p>

        <div className="mb-4 rounded-lg bg-sand p-4 text-[0.83rem]">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <div className="text-[0.68rem] uppercase tracking-[0.06em] text-ink-muted">
                Risk Classification
              </div>
              <div className="text-[1.2rem] font-bold text-navy">
                {record.tier.icon} {record.tier.label} Risk —{" "}
                {record.percentage}%
              </div>
            </div>
            <div className="text-right text-[0.75rem] text-ink-muted">
              Score: {record.score}/{record.maxScore}
              <br />
              Submitted:{" "}
              {new Date(record.timestamp).toLocaleDateString("en-GB")}
            </div>
          </div>
          {groupEntries.map(([gk, g]) => {
            const matched = g.questions.filter((q) =>
              record.selectedIds.includes(q.id),
            );
            return (
              <div key={gk} className="mb-1.5">
                <strong>
                  {g.icon} {g.label}:
                </strong>{" "}
                {matched.length}/{g.questions.length} selected —{" "}
                {record.breakdown[gk]} pts
              </div>
            );
          })}
        </div>

        {error && <Alert type="error" message={error} />}

        <FormSelect
          id="rx-diagnosis"
          label="Confirmed Clinical Impression / Diagnosis"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        >
          <option value="">Select clinical impression...</option>
          {DIAGNOSIS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </FormSelect>

        <div className="mb-4 rounded-lg border-l-[3px] border-teal bg-teal-dim p-4">
          <div className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-teal">
            Recommendation
          </div>
          <div className="text-[0.85rem] text-ink">
            {record.automaticRecommendation || record.tier.recommendation}
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-[0.78rem] font-semibold tracking-wide text-ink">
            Additional Recommendation
          </label>
          <textarea
            rows={3}
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            placeholder="Add clinician-approved guidance, tests, referrals, or follow-up instructions."
            className="w-full resize-y rounded-lg border-[1.5px] border-border bg-sand px-3.5 py-2.5 text-[0.9rem] text-ink transition-colors duration-200 focus:border-teal focus:bg-white focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-[0.78rem] font-semibold tracking-wide text-ink">
            Clinical Notes &amp; Next Steps
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Refer for PSA blood test. Book follow-up in 2 weeks. Arrange pelvic ultrasound."
            className="w-full resize-y rounded-lg border-[1.5px] border-border bg-sand px-3.5 py-2.5 text-[0.9rem] text-ink transition-colors duration-200 focus:border-teal focus:bg-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[0.78rem] font-semibold tracking-wide text-ink">
              Follow-up Date
            </label>
            <input
              type="date"
              value={followup}
              onChange={(e) => setFollowup(e.target.value)}
              className="w-full rounded-lg border-[1.5px] border-border bg-sand px-3.5 py-2.5 text-[0.9rem] text-ink transition-colors duration-200 focus:border-teal focus:bg-white focus:outline-none"
            />
          </div>
          <FormSelect
            id="rx-urgency"
            label="Urgency"
            value={urgency}
            onChange={(e) =>
              setUrgency(e.target.value as "Routine" | "Priority" | "Urgent")
            }
          >
            <option value="Routine">Routine</option>
            <option value="Priority">Priority (within 2 weeks)</option>
            <option value="Urgent">Urgent (within 48 hours)</option>
          </FormSelect>
        </div>

        <div className="mt-[22px] flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Submit Review & Save Recommendation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
