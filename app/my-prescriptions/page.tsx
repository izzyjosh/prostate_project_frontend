"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import {
  authApiClient,
  PatientAssessmentResponse,
  getApiErrorMessage,
} from "@/lib/api";

function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function MyRecommendationsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [recommendations, setRecommendations] = useState<
    PatientAssessmentResponse[]
  >([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const user = await authApiClient.getCurrentUser();
        if (user.role !== "patient") {
          router.push("/login");
          return;
        }
        setRecommendations(await authApiClient.getPatientRecommendations());
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setReady(true);
      }
    };

    load();
  }, [router]);

  if (!ready) return null;

  return (
    <DashboardShell
      active="/my-prescriptions"
      title="My Recommendations"
      subtitle="Automatic guidance generated from your assessments"
      action={
        recommendations.length > 0 ? (
          <Button variant="secondary" onClick={() => window.print()}>
            Print
          </Button>
        ) : undefined
      }
    >
      {error && <Alert type="error" message={error} />}
      {recommendations.length === 0 ? (
        <div className="rounded-card-lg border border-border bg-white p-12 text-center shadow-card">
          <h3 className="mb-2 font-display text-[1.3rem] text-navy">
            No recommendations yet
          </h3>
          <p className="mb-5 text-ink-muted">
            Complete an assessment to receive personalized recommendations.
          </p>
          <Button variant="primary" href="/pre-assessment">
            Begin Assessment
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {recommendations.map((assessment) => (
            <article
              key={assessment.id}
              className="rounded-card-lg border border-border bg-white shadow-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-sand px-6 py-5">
                <div>
                  <Badge variant={assessment.tier.tier}>
                    {assessment.tier.icon} {assessment.tier.label}
                  </Badge>
                  <h2 className="mt-2 font-display text-[1.2rem] text-navy">
                    Recommendation
                  </h2>
                </div>
                <div className="text-right text-[0.78rem] text-ink-muted">
                  <div>{assessment.percentage}% risk score</div>
                  <div>{formatDate(assessment.timestamp)}</div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[0.9rem] leading-relaxed text-ink">
                  {assessment.automaticRecommendation ||
                    assessment.tier.recommendation}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
