"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import ReviewModal from "@/components/ReviewModal";
import {
  authApiClient,
  ClinicianAssessmentResponse,
  ClinicianDashboardResponse,
  getApiErrorMessage,
} from "@/lib/api";

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [dashboard, setDashboard] = useState<ClinicianDashboardResponse | null>(
    null,
  );
  const [reviewing, setReviewing] =
    useState<ClinicianAssessmentResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const user = await authApiClient.getCurrentUser();
        if (user.role !== "clinician") {
          router.push("/login");
          return;
        }

        setDashboard(await authApiClient.getClinicianDashboard());
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setReady(true);
      }
    };

    load();
  }, [router]);

  if (!ready) return null;

  const pending = dashboard?.pendingReviews ?? [];
  const reviewed = dashboard?.reviewedAssessments ?? [];
  const stats = dashboard?.stats ?? {
    pendingReviews: 0,
    totalAssessments: 0,
    urgentCases: 0,
    reviewedToday: 0,
  };

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardShell
      active="/doctor-dashboard"
      title="Clinician Dashboard"
      subtitle="ABUTH Urology / Oncology — Prostate Cancer CDSS"
      action={
        <span className="text-[0.78rem] text-ink-muted">{todayLabel}</span>
      }
    >
      {error && <Alert type="error" message={error} />}

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending Reviews"
          value={String(stats.pendingReviews)}
          sub="Require attention"
          accentColor="amber"
        />
        <StatCard
          label="Total Assessments"
          value={String(stats.totalAssessments)}
          sub=""
        />
        <StatCard
          label="Urgent Cases"
          value={String(stats.urgentCases)}
          sub="High/Urgent tier"
          accentColor="danger"
        />
        <StatCard
          label="Reviewed Today"
          value={String(stats.reviewedToday)}
          sub=""
          accentColor="teal"
        />
      </div>

      {stats.urgentCases > 0 && (
        <Alert
          type="amber"
          message={`There are ${stats.urgentCases} urgent or high risk assessments awaiting immediate review.`}
        />
      )}

      <div className="mb-6 rounded-card-lg border border-border bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-[18px]">
          <h3 className="text-[0.95rem] font-bold text-navy">
            ⏳ Pending Pre-Assessment Reviews
          </h3>
          {pending.length > 5 && (
            <Link
              href="/pending-reviews"
              className="text-[0.78rem] font-semibold text-teal"
            >
              View all →
            </Link>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.85rem]">
            <thead>
              <tr>
                {[
                  "Patient",
                  "Date Submitted",
                  "Score",
                  "Risk Tier",
                  "Symptoms Selected",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap border-b border-border bg-sand px-4 py-2.5 text-left text-[0.68rem] font-bold uppercase tracking-[0.07em] text-ink-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-ink-muted"
                  >
                    No pending reviews.
                  </td>
                </tr>
              ) : (
                pending.slice(0, 5).map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-border last:border-0 hover:bg-sand"
                  >
                    <td className="px-4 py-3.5 font-semibold text-ink">
                      {a.patientName}
                    </td>
                    <td className="px-4 py-3.5">{formatDate(a.timestamp)}</td>
                    <td className="px-4 py-3.5">
                      <strong>{a.percentage}%</strong>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={a.tier.tier}>
                        {a.tier.icon} {a.tier.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      {a.selectedIds.length} symptoms
                    </td>
                    <td className="px-4 py-3.5">
                      <Button
                        variant="primary"
                        small
                        onClick={() => setReviewing(a)}
                      >
                        Review →
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
        <div className="border-b border-border px-6 py-[18px]">
          <h3 className="text-[0.95rem] font-bold text-navy">
            ✅ Recently Reviewed
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.85rem]">
            <thead>
              <tr>
                {[
                  "Patient",
                  "Date Reviewed",
                  "Risk Tier",
                  "Confirmed Diagnosis",
                  "Prescription",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap border-b border-border bg-sand px-4 py-2.5 text-left text-[0.68rem] font-bold uppercase tracking-[0.07em] text-ink-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviewed.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-ink-muted"
                  >
                    No reviewed assessments yet.
                  </td>
                </tr>
              ) : (
                reviewed.slice(0, 5).map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-border last:border-0 hover:bg-sand"
                  >
                    <td className="px-4 py-3.5 font-semibold text-ink">
                      {a.patientName}
                    </td>
                    <td className="px-4 py-3.5">
                      {a.reviewedAt ? formatDate(a.reviewedAt) : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={a.tier.tier}>{a.tier.label}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-[0.8rem]">
                      {a.confirmedDiagnosis || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-[0.8rem]">
                      {a.prescription ? "Issued" : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reviewing && (
        <ReviewModal
          record={reviewing}
          onClose={() => setReviewing(null)}
          onSubmitted={() => {
            setReviewing(null);
            authApiClient
              .getClinicianDashboard()
              .then(setDashboard)
              .catch((loadError) => {
                setError(getApiErrorMessage(loadError));
              });
          }}
        />
      )}
    </DashboardShell>
  );
}
