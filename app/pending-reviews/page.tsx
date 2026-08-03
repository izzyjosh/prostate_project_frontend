"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import ReviewModal from "@/components/ReviewModal";
import {
  authApiClient,
  ClinicianAssessmentResponse,
  getApiErrorMessage,
} from "@/lib/api";
const TIER_FILTERS = ["all", "urgent", "high", "moderate", "low"] as const;
const TIER_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  moderate: 2,
  low: 3,
};

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PendingReviewsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [assessments, setAssessments] = useState<ClinicianAssessmentResponse[]>(
    [],
  );
  const [reviewing, setReviewing] =
    useState<ClinicianAssessmentResponse | null>(null);
  const [filter, setFilter] = useState<(typeof TIER_FILTERS)[number]>("all");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const user = await authApiClient.getCurrentUser();
        if (user.role !== "clinician") {
          router.push("/login");
          return;
        }

        setAssessments(await authApiClient.getClinicianPendingReviews());
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setReady(true);
      }
    };

    load();
  }, [router]);

  if (!ready) return null;

  const filtered = (
    filter === "all"
      ? assessments
      : assessments.filter((a) => a.tier.tier === filter)
  )
    .slice()
    .sort(
      (a, b) => (TIER_ORDER[a.tier.tier] ?? 3) - (TIER_ORDER[b.tier.tier] ?? 3),
    );

  return (
    <DashboardShell
      active="/pending-reviews"
      title="Pending Reviews"
      subtitle="All pre-assessments awaiting clinical review, sorted by urgency"
    >
      {error && <Alert type="error" message={error} />}

      <div className="mb-5 flex flex-wrap gap-2">
        {TIER_FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full border px-4 py-1.5 text-[0.78rem] font-semibold capitalize transition-colors ${
              filter === t
                ? "border-teal bg-teal text-white"
                : "border-border bg-white text-ink-mid hover:border-teal hover:text-teal"
            }`}
          >
            {t === "all" ? "All" : t}
          </button>
        ))}
      </div>

      <div className="rounded-card-lg border border-border bg-white shadow-card">
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
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-ink-muted"
                  >
                    No pending reviews
                    {filter !== "all" ? ` in the ${filter} tier` : ""}.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
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

      {reviewing && (
        <ReviewModal
          record={reviewing}
          onClose={() => setReviewing(null)}
          onSubmitted={() => {
            setReviewing(null);
            authApiClient
              .getClinicianPendingReviews()
              .then(setAssessments)
              .catch((loadError) => {
                setError(getApiErrorMessage(loadError));
              });
          }}
        />
      )}
    </DashboardShell>
  );
}
