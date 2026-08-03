"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import { authApiClient, PatientAssessmentResponse } from "@/lib/api";

const HEADER_BG: Record<string, string> = {
  urgent: "bg-danger-dim",
  high: "bg-amber-dim",
};

function formatLongDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatFollowup(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function MyResultsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [assessments, setAssessments] = useState<PatientAssessmentResponse[]>(
    [],
  );

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authApiClient.getCurrentUser();
        if (user.role !== "patient") {
          router.replace("/login");
          return;
        }

        setAssessments(await authApiClient.getPatientAssessments());
        setReady(true);
      } catch {
        router.replace("/login");
      }
    };
    loadUser();
  }, [router]);

  if (!ready) return null;

  return (
    <DashboardShell
      active="/my-results"
      title="My Assessment Results"
      subtitle="All your submitted pre-assessments and clinical feedback"
      action={
        <Button variant="primary" href="/pre-assessment">
          + New Assessment
        </Button>
      }
    >
      {assessments.length === 0 ? (
        <div className="rounded-card-lg border border-border bg-white p-12 text-center shadow-card">
          <div className="mb-3 text-4xl">📋</div>
          <h3 className="mb-2 font-display text-[1.3rem] text-navy">
            No assessments yet
          </h3>
          <p className="mb-5 text-ink-muted">
            Complete your first pre-assessment to see results here.
          </p>
          <Button variant="primary" href="/pre-assessment">
            Begin Pre-Assessment →
          </Button>
        </div>
      ) : (
        assessments.map((a) => (
          <div
            key={a.id}
            className="mb-5 rounded-card-lg border border-border bg-white shadow-card"
          >
            <div
              className={`flex items-center justify-between border-b border-border px-6 py-5 ${
                HEADER_BG[a.tier.tier] ?? "bg-sand"
              }`}
            >
              <div>
                <div className="mb-1.5">
                  <Badge variant={a.tier.tier}>
                    {a.tier.icon} {a.tier.label} Risk
                  </Badge>
                </div>
                <div className="font-display text-[1.2rem] text-navy">
                  {a.percentage}% Score — {a.score}/{a.maxScore} points
                </div>
                <div className="mt-[3px] text-[0.75rem] text-ink-muted">
                  Submitted: {formatLongDate(a.timestamp)}
                </div>
              </div>
              <Badge
                variant={a.status === "confirmed" ? "confirmed" : "pending"}
              >
                {a.status === "confirmed"
                  ? "✅ Reviewed by Doctor"
                  : "⏳ Pending Review"}
              </Badge>
            </div>
            <div className="p-6">
              <div className="mb-2 text-[0.75rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                CDSS Recommendation
              </div>
              <p className="mb-4 text-[0.85rem] text-ink-mid">
                {a.tier.recommendation}
              </p>
              {a.status === "confirmed" ? (
                <div className="rounded-lg border-l-[3px] border-teal bg-teal-dim p-4">
                  <div className="mb-2 text-[0.72rem] font-bold uppercase text-teal">
                    Doctor&apos;s Clinical Review
                  </div>
                  <div className="text-[0.85rem] text-ink">
                    <strong>Clinical Impression:</strong>{" "}
                    {a.confirmedDiagnosis || "—"}
                  </div>
                  {a.prescription && (
                    <div className="mt-1.5 text-[0.85rem] text-ink">
                      <strong>Prescription:</strong> {a.prescription}
                    </div>
                  )}
                  {a.doctorNotes && (
                    <div className="mt-1.5 text-[0.85rem] text-ink">
                      <strong>Notes:</strong> {a.doctorNotes}
                    </div>
                  )}
                  {a.followupDate && (
                    <div className="mt-1.5 text-[0.85rem] text-ink">
                      <strong>Follow-up:</strong>{" "}
                      {formatFollowup(a.followupDate)}
                    </div>
                  )}
                </div>
              ) : (
                <Alert
                  type="amber"
                  message="Your assessment is awaiting review by a clinician at ABUTH. You will be contacted when the review is complete."
                />
              )}
            </div>
          </div>
        ))
      )}
    </DashboardShell>
  );
}
