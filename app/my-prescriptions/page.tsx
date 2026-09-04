"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import {
  authApiClient,
  PatientAssessmentResponse,
  getApiErrorMessage,
} from "@/lib/api";

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

function isUpcoming(ts: string) {
  const followup = new Date(ts);
  followup.setHours(23, 59, 59, 999);
  return followup.getTime() >= Date.now();
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
        {label}
      </div>
      <div className="whitespace-pre-line text-[0.85rem] text-ink">{value}</div>
    </div>
  );
}

export default function MyPrescriptionsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [prescriptions, setPrescriptions] = useState<
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

        setPrescriptions(await authApiClient.getPatientPrescriptions());
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setReady(true);
      }
    };

    load();
  }, [router]);

  if (!ready) return null;

  const latest = prescriptions[0] ?? null;
  const upcoming = prescriptions.filter(
    (p) => p.followupDate && isUpcoming(p.followupDate),
  );
  const nextFollowup = upcoming
    .map((p) => p.followupDate as string)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];

  return (
    <DashboardShell
      active="/my-prescriptions"
      title="My Recommendations"
      subtitle="Automatic assessment guidance and recommendations issued by your doctor"
      action={
        prescriptions.length > 0 ? (
          <Button variant="secondary" onClick={() => window.print()}>
            🖨 Print
          </Button>
        ) : undefined
      }
    >
      {error && <Alert type="error" message={error} />}

      {prescriptions.length === 0 ? (
        <div className="rounded-card-lg border border-border bg-white p-12 text-center shadow-card">
          <div className="mb-3 text-4xl">💊</div>
          <h3 className="mb-2 font-display text-[1.3rem] text-navy">
            No recommendations yet
          </h3>
          <p className="mb-5 text-ink-muted">
            Recommendations will appear here after you complete an assessment or
            a clinician reviews it.
          </p>
          <Button variant="primary" href="/my-results">
            View my results →
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3 print:hidden">
            <StatCard
              label="Recommendations"
              value={String(prescriptions.length)}
              sub="Automatic and clinician guidance"
            />
            <StatCard
              label="Most Recent"
              value={
                latest?.reviewedAt
                  ? new Date(latest.reviewedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"
              }
              sub="Date issued"
              accentColor="teal"
              small
            />
            <StatCard
              label="Next Follow-up"
              value={nextFollowup ? formatFollowup(nextFollowup) : "None"}
              sub={
                upcoming.length > 0
                  ? `${upcoming.length} scheduled`
                  : "No appointment scheduled"
              }
              accentColor="amber"
              small
            />
          </div>

          <Alert
            type="info"
            message="This guidance supports, but does not replace, a clinician's assessment. Contact a clinician if your symptoms worsen or you develop new symptoms."
          />

          <div className="flex flex-col gap-5">
            {prescriptions.map((p) => (
              <div
                key={p.id}
                className="break-inside-avoid rounded-card-lg border border-border bg-white shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-sand px-6 py-5">
                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Badge variant={p.tier.tier}>
                        {p.tier.icon} {p.tier.label}
                      </Badge>
                      {p.urgency && (
                        <span className="text-[0.7rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                          {p.urgency}
                        </span>
                      )}
                    </div>
                    <div className="font-display text-[1.2rem] text-navy">
                      Recommendation
                    </div>
                    <div className="mt-[3px] text-[0.75rem] text-ink-muted">
                      Issued:{" "}
                      {p.reviewedAt ? formatLongDate(p.reviewedAt) : "—"}
                    </div>
                  </div>
                  <div className="text-right text-[0.72rem] text-ink-muted">
                    <div>Assessment score</div>
                    <div className="text-[0.95rem] font-bold text-navy">
                      {p.percentage}%
                    </div>
                    <div>
                      Submitted{" "}
                      {new Date(p.timestamp).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Recommendation"
                      value={p.automaticRecommendation || p.tier.recommendation}
                    />
                    <Field
                      label="Clinical Impression"
                      value={p.confirmedDiagnosis || "—"}
                    />
                    {p.doctorRecommendation && (
                      <Field
                        label="Additional Recommendation"
                        value={p.doctorRecommendation}
                      />
                    )}
                    {p.doctorNotes && (
                      <Field label="Doctor's Notes" value={p.doctorNotes} />
                    )}
                  </div>

                  {p.followupDate && (
                    <div
                      className={`mt-4 rounded-lg border-l-[3px] p-3.5 text-[0.82rem] ${
                        isUpcoming(p.followupDate)
                          ? "border-amber bg-amber-dim text-amber"
                          : "border-border bg-sand text-ink-muted"
                      }`}
                    >
                      <strong>Follow-up appointment:</strong>{" "}
                      {formatFollowup(p.followupDate)}
                      {!isUpcoming(p.followupDate) && " (date passed)"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
