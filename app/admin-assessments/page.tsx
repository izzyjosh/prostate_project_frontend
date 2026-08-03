"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import Badge from "@/components/Badge";
import Alert from "@/components/Alert";
import {
  authApiClient,
  ClinicianAssessmentResponse,
  getApiErrorMessage,
} from "@/lib/api";

const TIER_FILTERS = ["all", "urgent", "high", "moderate", "low"] as const;
const STATUS_FILTERS = ["all", "pending", "confirmed"] as const;

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminAssessmentsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [assessments, setAssessments] = useState<ClinicianAssessmentResponse[]>(
    [],
  );
  const [error, setError] = useState("");
  const [tierFilter, setTierFilter] =
    useState<(typeof TIER_FILTERS)[number]>("all");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]>("all");

  useEffect(() => {
    const load = async () => {
      try {
        const user = await authApiClient.getCurrentUser();
        if (user.role !== "admin") {
          router.push("/login");
          return;
        }

        const data = await authApiClient.getAdminAssessments();
        setAssessments(
          data
            .slice()
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime(),
            ),
        );
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setReady(true);
      }
    };

    load();
  }, [router]);

  if (!ready) return null;

  const filtered = assessments.filter(
    (a) =>
      (tierFilter === "all" || a.tier.tier === tierFilter) &&
      (statusFilter === "all" || a.status === statusFilter),
  );

  return (
    <DashboardShell
      active="/admin-assessments"
      title="All Assessments"
      subtitle="System-wide record of every pre-assessment submitted, for audit and oversight"
    >
      {error && <Alert type="error" message={error} />}

      <div className="mb-5 flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {TIER_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`rounded-full border px-4 py-1.5 text-[0.78rem] font-semibold capitalize transition-colors ${
                tierFilter === t
                  ? "border-teal bg-teal text-white"
                  : "border-border bg-white text-ink-mid hover:border-teal hover:text-teal"
              }`}
            >
              {t === "all" ? "All Tiers" : t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-4 py-1.5 text-[0.78rem] font-semibold capitalize transition-colors ${
                statusFilter === s
                  ? "border-teal bg-teal text-white"
                  : "border-border bg-white text-ink-mid hover:border-teal hover:text-teal"
              }`}
            >
              {s === "all"
                ? "All Statuses"
                : s === "confirmed"
                  ? "Reviewed"
                  : "Pending"}
            </button>
          ))}
        </div>
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
                  "Status",
                  "Reviewed",
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
                    No assessments match these filters.
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
                      <Badge
                        variant={
                          a.status === "confirmed" ? "confirmed" : "pending"
                        }
                      >
                        {a.status === "confirmed" ? "Reviewed" : "Pending"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      {a.reviewedAt ? formatDate(a.reviewedAt) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
