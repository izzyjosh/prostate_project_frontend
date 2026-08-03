"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";
import Alert from "@/components/Alert";
import {
  authApiClient,
  AdminDashboardResponse,
  getApiErrorMessage,
} from "@/lib/api";

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(
    null,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const user = await authApiClient.getCurrentUser();
        if (user.role !== "admin") {
          router.push("/login");
          return;
        }

        setDashboard(await authApiClient.getAdminDashboard());
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setReady(true);
      }
    };

    load();
  }, [router]);

  if (!ready) return null;

  const stats = dashboard?.stats ?? {
    patients: 0,
    clinicians: 0,
    admins: 0,
    assessments: 0,
    pendingReviews: 0,
    prescriptionsIssued: 0,
  };
  const recent = dashboard?.recentAssessments ?? [];
  const urgent = recent.filter(
    (a) => a.tier.tier === "urgent" || a.tier.tier === "high",
  );

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardShell
      active="/admin-dashboard"
      title="Admin Dashboard"
      subtitle="ABUTH ProstateCare CDSS — System Overview"
      action={
        <span className="text-[0.78rem] text-ink-muted">{todayLabel}</span>
      }
    >
      {error && <Alert type="error" message={error} />}

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Registered Patients"
          value={String(stats.patients)}
          sub="Total accounts"
        />
        <StatCard
          label="Clinicians"
          value={String(stats.clinicians)}
          sub="Doctor accounts"
          accentColor="teal"
        />
        <StatCard
          label="Total Assessments"
          value={String(stats.assessments)}
          sub="Submitted system-wide"
        />
        <StatCard
          label="Pending Reviews"
          value={String(stats.pendingReviews)}
          sub={`${stats.prescriptionsIssued} prescriptions issued`}
          accentColor="amber"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Link
          href="/admin-doctors"
          className="rounded-card-lg border border-border bg-white p-5 shadow-card transition-colors hover:border-teal"
        >
          <div className="mb-1 text-[1.4rem]">🩺</div>
          <div className="font-semibold text-navy">Manage Doctors</div>
          <div className="mt-0.5 text-[0.78rem] text-ink-muted">
            View clinician accounts
          </div>
        </Link>
        <Link
          href="/admin-patients"
          className="rounded-card-lg border border-border bg-white p-5 shadow-card transition-colors hover:border-teal"
        >
          <div className="mb-1 text-[1.4rem]">👥</div>
          <div className="font-semibold text-navy">Manage Patients</div>
          <div className="mt-0.5 text-[0.78rem] text-ink-muted">
            View registered patients
          </div>
        </Link>
        <Link
          href="/admin-assessments"
          className="rounded-card-lg border border-border bg-white p-5 shadow-card transition-colors hover:border-teal"
        >
          <div className="mb-1 text-[1.4rem]">📋</div>
          <div className="font-semibold text-navy">All Assessments</div>
          <div className="mt-0.5 text-[0.78rem] text-ink-muted">
            System-wide oversight
          </div>
        </Link>
      </div>

      <div className="rounded-card-lg border border-border bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-[18px]">
          <h3 className="text-[0.95rem] font-bold text-navy">
            Recent Activity
          </h3>
          <Link
            href="/admin-assessments"
            className="text-[0.78rem] font-semibold text-teal"
          >
            View all →
          </Link>
        </div>
        {urgent.length > 0 && (
          <div className="px-6 pt-4">
            <Alert
              type="amber"
              message={`${urgent.length} of the most recent assessments are high or urgent risk.`}
            />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-[0.85rem]">
            <thead>
              <tr>
                {["Patient", "Date Submitted", "Risk Tier", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap border-b border-border bg-sand px-4 py-2.5 text-left text-[0.68rem] font-bold uppercase tracking-[0.07em] text-ink-muted"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-ink-muted"
                  >
                    No assessments submitted yet.
                  </td>
                </tr>
              ) : (
                recent.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-border last:border-0 hover:bg-sand"
                  >
                    <td className="px-4 py-3.5 font-semibold text-ink">
                      {a.patientName}
                    </td>
                    <td className="px-4 py-3.5">{formatDate(a.timestamp)}</td>
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
