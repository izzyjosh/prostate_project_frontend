"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
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
      subtitle="All your submitted pre-assessments and recommendations"
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
              <Badge variant="confirmed">Recommendation Ready</Badge>
            </div>
            <div className="p-6">
              <div className="mb-2 text-[0.75rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                Recommendation
              </div>
              <p className="mb-4 text-[0.85rem] text-ink-mid">
                {a.automaticRecommendation || a.tier.recommendation}
              </p>
            </div>
          </div>
        ))
      )}
    </DashboardShell>
  );
}
