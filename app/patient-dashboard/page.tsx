"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import { authApiClient, PatientDashboardResponse } from "@/lib/api";

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PatientDashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [dashboard, setDashboard] = useState<PatientDashboardResponse | null>(
    null,
  );

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await authApiClient.getPatientDashboard();
        setDashboard(data);
        setReady(true);
      } catch {
        router.replace("/login");
      }
    };

    loadDashboard();
  }, [router]);

  if (!ready || !dashboard) return null;

  const assessments = dashboard.assessments;

  return (
    <DashboardShell
      active="/patient-dashboard"
      title={`Welcome, ${dashboard.profile.firstName}`}
      subtitle="Your prostate health pre-assessment portal — ABUTH, Zaria"
      action={
        <Button variant="primary" href="/pre-assessment">
          + New Pre-Assessment
        </Button>
      }
    >
      {assessments.length === 0 && (
        <Alert
          type="info"
          message="👋 You have not yet completed a pre-assessment. Begin your assessment now →"
        />
      )}

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Assessments"
          value={String(dashboard.stats.assessments)}
          sub="Total submitted"
        />
        <StatCard
          label="Latest Risk Level"
          value={dashboard.stats.latestRiskLevel}
          sub="From last assessment"
          accentColor="teal"
          small
        />
        <StatCard
          label="Recommendations"
          value={String(dashboard.stats.prescriptions)}
          sub="Automatic and clinician guidance"
        />
        <StatCard
          label="Last Assessment"
          value={
            dashboard.stats.latestAssessmentDate
              ? formatDate(dashboard.stats.latestAssessmentDate)
              : "—"
          }
          sub="Date submitted"
          small
        />
      </div>

      <div className="mb-6 rounded-card-lg border border-border bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-[18px]">
          <h3 className="text-[0.95rem] font-bold text-navy">
            Pre-Assessment History
          </h3>
          <Link
            href="/my-results"
            className="text-[0.78rem] font-semibold text-teal"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.85rem]">
            <thead>
              <tr>
                {["Date", "Score", "Risk Tier", "Status", "Action"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap border-b border-border bg-sand px-4 py-2.5 text-left text-[0.68rem] font-bold uppercase tracking-[0.07em] text-ink-muted"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-ink-muted"
                  >
                    No assessments yet. Start your first pre-assessment.
                  </td>
                </tr>
              ) : (
                assessments.slice(0, 5).map((assessment) => (
                  <tr
                    key={assessment.id}
                    className="border-b border-border last:border-0 hover:bg-sand"
                  >
                    <td className="px-4 py-3.5">
                      {formatDate(assessment.timestamp)}
                    </td>
                    <td className="px-4 py-3.5">
                      <strong>{assessment.percentage}%</strong>{" "}
                      <span className="text-[0.75rem] text-ink-muted">
                        ({assessment.score}/{assessment.maxScore}pts)
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={assessment.tier.tier}>
                        {assessment.tier.icon} {assessment.tier.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          assessment.status === "confirmed"
                            ? "confirmed"
                            : "pending"
                        }
                      >
                        {assessment.status === "confirmed"
                          ? "Reviewed"
                          : "Pending Review"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Button variant="secondary" small href="/my-results">
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-card-lg border border-border bg-white shadow-card">
        <div className="flex items-center gap-7 p-6">
          <div className="text-5xl">🩺</div>
          <div>
            <h3 className="mb-1.5 font-display text-[1.3rem] text-navy">
              Ready to begin your pre-assessment?
            </h3>
            <p className="mb-4 max-w-[500px] text-[0.85rem] text-ink-muted">
              Answer a structured set of questions about your symptoms and risk
              factors. This typically takes 5–8 minutes. Your responses will be
              reviewed by a clinician at ABUTH.
            </p>
            <Button variant="primary" href="/pre-assessment">
              Begin Pre-Assessment →
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
