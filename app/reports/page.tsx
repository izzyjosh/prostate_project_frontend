"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import {
  authApiClient,
  ClinicianAssessmentResponse,
  ClinicianPatientSummary,
  getApiErrorMessage,
} from "@/lib/api";
import { KNOWLEDGE_BASE, GroupKey, QuestionGroup } from "@/lib/cdss";

type TierKey = "urgent" | "high" | "moderate" | "low";

const TIER_META: Record<
  TierKey,
  { label: string; icon: string; bar: string; text: string }
> = {
  urgent: {
    label: "Urgent",
    icon: "🚨",
    bar: "bg-danger",
    text: "text-danger",
  },
  high: {
    label: "High Risk",
    icon: "🔴",
    bar: "bg-[#B36B00]",
    text: "text-[#B36B00]",
  },
  moderate: {
    label: "Moderate Risk",
    icon: "🟡",
    bar: "bg-amber",
    text: "text-amber",
  },
  low: {
    label: "Low Risk",
    icon: "🟢",
    bar: "bg-success",
    text: "text-success",
  },
};

const TIER_ORDER: TierKey[] = ["urgent", "high", "moderate", "low"];

const QUESTION_TEXT: Record<string, { text: string; group: string }> =
  Object.values(KNOWLEDGE_BASE).reduce(
    (acc, group: QuestionGroup) => {
      group.questions.forEach((q) => {
        acc[q.id] = { text: q.text.split(":")[0], group: group.label };
      });
      return acc;
    },
    {} as Record<string, { text: string; group: string }>,
  );

function monthKey(ts: string) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-GB", {
    month: "short",
    year: "2-digit",
  });
}

function daysBetween(from: string, to: string) {
  return (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000;
}

function DistributionRow({
  label,
  icon,
  count,
  total,
  bar,
  text,
}: {
  label: string;
  icon?: string;
  count: number;
  total: number;
  bar: string;
  text: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[0.8rem]">
        <span className="font-semibold text-ink">
          {icon ? `${icon} ` : ""}
          {label}
        </span>
        <span className={`font-bold ${text}`}>
          {count}
          <span className="ml-1.5 font-normal text-ink-muted">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-sand-dark">
        <div
          className={`h-full rounded-full ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="break-inside-avoid rounded-card-lg border border-border bg-white shadow-card">
      <div className="border-b border-border px-6 py-[18px]">
        <h3 className="text-[0.95rem] font-bold text-navy">{title}</h3>
        {hint && <p className="mt-0.5 text-[0.72rem] text-ink-muted">{hint}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function ReportsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState<ClinicianAssessmentResponse[]>([]);
  const [reviewed, setReviewed] = useState<ClinicianAssessmentResponse[]>([]);
  const [patients, setPatients] = useState<ClinicianPatientSummary[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const user = await authApiClient.getCurrentUser();
        if (user.role !== "clinician") {
          router.push("/login");
          return;
        }

        const [pendingList, reviewedList, patientList] = await Promise.all([
          authApiClient.getClinicianPendingReviews(),
          authApiClient.getClinicianReviewedAssessments(),
          authApiClient.getClinicianPatients(),
        ]);

        setPending(pendingList);
        setReviewed(reviewedList);
        setPatients(patientList);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setReady(true);
      }
    };

    load();
  }, [router]);

  const all = useMemo(() => [...pending, ...reviewed], [pending, reviewed]);

  const tierCounts = useMemo(() => {
    const counts: Record<TierKey, number> = {
      urgent: 0,
      high: 0,
      moderate: 0,
      low: 0,
    };
    all.forEach((a) => {
      const tier = a.tier.tier as TierKey;
      if (tier in counts) counts[tier] += 1;
    });
    return counts;
  }, [all]);

  const groupBurden = useMemo(() => {
    const keys = Object.keys(KNOWLEDGE_BASE) as GroupKey[];
    return keys
      .map((key) => {
        const group = KNOWLEDGE_BASE[key];
        const maxPerAssessment = group.questions.length * group.weight;
        const scored = all.reduce(
          (sum, a) => sum + (a.breakdown?.[key] ?? 0),
          0,
        );
        const maxTotal = maxPerAssessment * all.length;
        return {
          key,
          label: group.label,
          icon: group.icon,
          scored,
          maxTotal,
          pct: maxTotal > 0 ? Math.round((scored / maxTotal) * 100) : 0,
        };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [all]);

  const topSymptoms = useMemo(() => {
    const counts = new Map<string, number>();
    all.forEach((a) => {
      (a.selectedIds ?? []).forEach((id) => {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id, count]) => ({
        id,
        count,
        text: QUESTION_TEXT[id]?.text ?? id,
        group: QUESTION_TEXT[id]?.group ?? "Unknown",
      }));
  }, [all]);

  const monthlyTrend = useMemo(() => {
    const counts = new Map<string, number>();
    all.forEach((a) => {
      const key = monthKey(a.timestamp);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);
  }, [all]);

  const turnaround = useMemo(() => {
    const times = reviewed
      .filter((a) => a.reviewedAt)
      .map((a) => daysBetween(a.timestamp, a.reviewedAt as string))
      .filter((d) => d >= 0);
    if (times.length === 0) return null;
    return times.reduce((sum, d) => sum + d, 0) / times.length;
  }, [reviewed]);

  if (!ready) return null;

  const total = all.length;
  const reviewRate =
    total > 0 ? Math.round((reviewed.length / total) * 100) : 0;
  const recommended = reviewed.length;
  const urgentBacklog = pending.filter(
    (a) => a.tier.tier === "urgent" || a.tier.tier === "high",
  );
  const maxMonth = Math.max(1, ...monthlyTrend.map(([, count]) => count));
  const maxSymptom = Math.max(1, ...topSymptoms.map((s) => s.count));

  const generatedLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardShell
      active="/reports"
      title="Clinical Reports"
      subtitle="Aggregate CDSS analytics across all patient pre-assessments"
      action={
        <div className="flex items-center gap-3">
          <span className="text-[0.78rem] text-ink-muted print:hidden">
            {generatedLabel}
          </span>
          <span className="print:hidden">
            <Button variant="secondary" onClick={() => window.print()}>
              🖨 Print
            </Button>
          </span>
        </div>
      }
    >
      {error && <Alert type="error" message={error} />}

      {total === 0 ? (
        <div className="rounded-card-lg border border-border bg-white p-12 text-center shadow-card">
          <div className="mb-3 text-4xl">📊</div>
          <h3 className="mb-2 font-display text-[1.3rem] text-navy">
            No data to report yet
          </h3>
          <p className="text-ink-muted">
            Clinical reports are generated from submitted pre-assessments. They
            will appear here once patients begin completing assessments.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Assessments"
              value={String(total)}
              sub={`Across ${patients.length} patient${patients.length === 1 ? "" : "s"}`}
            />
            <StatCard
              label="Review Rate"
              value={`${reviewRate}%`}
              sub={`${reviewed.length} reviewed / ${pending.length} pending`}
              accentColor="teal"
            />
            <StatCard
              label="Recommendations Issued"
              value={String(recommended)}
              sub={`${reviewed.filter((a) => a.doctorRecommendation).length} include extra clinician guidance`}
            />
            <StatCard
              label="Avg. Turnaround"
              value={turnaround === null ? "—" : `${turnaround.toFixed(1)}d`}
              sub="Submission to review"
              accentColor={
                turnaround !== null && turnaround > 14 ? "danger" : "teal"
              }
            />
          </div>

          {urgentBacklog.length > 0 && (
            <Alert
              type="amber"
              message={`${urgentBacklog.length} high or urgent risk assessment${urgentBacklog.length === 1 ? " is" : "s are"} still awaiting review.`}
            />
          )}

          <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel
              title="Risk Tier Distribution"
              hint="All assessments by CDSS-assigned tier"
            >
              <div className="flex flex-col gap-4">
                {TIER_ORDER.map((tier) => (
                  <DistributionRow
                    key={tier}
                    label={TIER_META[tier].label}
                    icon={TIER_META[tier].icon}
                    count={tierCounts[tier]}
                    total={total}
                    bar={TIER_META[tier].bar}
                    text={TIER_META[tier].text}
                  />
                ))}
              </div>
            </Panel>

            <Panel
              title="Symptom Domain Burden"
              hint="Weighted score achieved vs. maximum possible per domain"
            >
              <div className="flex flex-col gap-4">
                {groupBurden.map((group) => (
                  <DistributionRow
                    key={group.key}
                    label={group.label}
                    icon={group.icon}
                    count={group.scored}
                    total={group.maxTotal}
                    bar="bg-teal"
                    text="text-teal"
                  />
                ))}
              </div>
            </Panel>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel
              title="Most Frequently Reported Indicators"
              hint="Top 8 items selected across all assessments"
            >
              {topSymptoms.length === 0 ? (
                <p className="text-[0.85rem] text-ink-muted">
                  No indicators recorded.
                </p>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {topSymptoms.map((symptom) => (
                    <div key={symptom.id}>
                      <div className="mb-1 flex items-start justify-between gap-3 text-[0.8rem]">
                        <span className="text-ink">
                          {symptom.text}
                          <span className="ml-1.5 text-[0.7rem] text-ink-muted">
                            {symptom.group}
                          </span>
                        </span>
                        <span className="whitespace-nowrap font-bold text-navy">
                          {symptom.count}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-sand-dark">
                        <div
                          className="h-full rounded-full bg-navy-light"
                          style={{
                            width: `${(symptom.count / maxSymptom) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel
              title="Assessment Volume"
              hint="Submissions per month (last 6 months with activity)"
            >
              <div className="flex h-[200px] items-end justify-around gap-3">
                {monthlyTrend.map(([key, count]) => (
                  <div
                    key={key}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <span className="text-[0.75rem] font-bold text-navy">
                      {count}
                    </span>
                    <div
                      className="w-full max-w-[46px] rounded-t-md bg-teal"
                      style={{
                        height: `${Math.max(4, (count / maxMonth) * 150)}px`,
                      }}
                    />
                    <span className="whitespace-nowrap text-[0.68rem] text-ink-muted">
                      {monthLabel(key)}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="rounded-card-lg border border-border bg-white shadow-card">
            <div className="border-b border-border px-6 py-[18px]">
              <h3 className="text-[0.95rem] font-bold text-navy">
                Patient Caseload Summary
              </h3>
              <p className="mt-0.5 text-[0.72rem] text-ink-muted">
                Latest assessment outcome per registered patient
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[0.85rem]">
                <thead>
                  <tr>
                    {[
                      "Patient",
                      "Assessments",
                      "Latest Tier",
                      "Latest Score",
                      "Status",
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
                  {patients.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-ink-muted"
                      >
                        No patients on file.
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => (
                      <tr
                        key={patient.id}
                        className="border-b border-border last:border-0 hover:bg-sand"
                      >
                        <td className="px-4 py-3.5 font-semibold text-ink">
                          {patient.fullName || patient.email}
                        </td>
                        <td className="px-4 py-3.5">
                          {patient.assessmentsCount}
                        </td>
                        <td className="px-4 py-3.5">
                          {patient.latestAssessment ? (
                            <Badge variant={patient.latestAssessment.tier.tier}>
                              {patient.latestAssessment.tier.icon}{" "}
                              {patient.latestAssessment.tier.label}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {patient.latestAssessment
                            ? `${patient.latestAssessment.percentage}%`
                            : "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          {patient.latestAssessment ? (
                            <Badge
                              variant={
                                patient.latestAssessment.status === "confirmed"
                                  ? "confirmed"
                                  : "pending"
                              }
                            >
                              {patient.latestAssessment.status === "confirmed"
                                ? "Reviewed"
                                : "Pending"}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
