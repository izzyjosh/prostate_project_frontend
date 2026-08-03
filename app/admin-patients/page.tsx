"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import Badge from "@/components/Badge";
import Alert from "@/components/Alert";
import {
  authApiClient,
  AdminUser,
  ClinicianAssessmentResponse,
  getApiErrorMessage,
} from "@/lib/api";

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminPatientsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [patients, setPatients] = useState<AdminUser[]>([]);
  const [assessments, setAssessments] = useState<ClinicianAssessmentResponse[]>(
    [],
  );
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const user = await authApiClient.getCurrentUser();
        if (user.role !== "admin") {
          router.push("/login");
          return;
        }

        const [users, allAssessments] = await Promise.all([
          authApiClient.getAdminUsers(),
          authApiClient.getAdminAssessments(),
        ]);
        setPatients(users.filter((u) => u.role === "patient"));
        setAssessments(allAssessments);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setReady(true);
      }
    };

    load();
  }, [router]);

  const assessmentsByPatient = useMemo(() => {
    const map = new Map<string, ClinicianAssessmentResponse[]>();
    for (const a of assessments) {
      const list = map.get(a.patientId) ?? [];
      list.push(a);
      map.set(a.patientId, list);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    }
    return map;
  }, [assessments]);

  if (!ready) return null;

  const filteredPatients = patients.filter((p) => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase();
    return (
      name.includes(query.toLowerCase()) ||
      p.email.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <DashboardShell
      active="/admin-patients"
      title="Patients"
      subtitle="All registered patient accounts across the system"
    >
      {error && <Alert type="error" message={error} />}

      <div className="mb-5">
        <input
          type="text"
          placeholder="Search patients by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-sm rounded-lg border-[1.5px] border-border bg-white px-3.5 py-2.5 text-[0.9rem] text-ink transition-colors duration-200 focus:border-teal focus:outline-none"
        />
      </div>

      <div className="rounded-card-lg border border-border bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-[0.85rem]">
            <thead>
              <tr>
                {[
                  "Patient",
                  "Contact",
                  "Assessments",
                  "Latest Risk",
                  "Registered",
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
              {filteredPatients.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-ink-muted"
                  >
                    No patients match your search.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const patientAssessments =
                    assessmentsByPatient.get(p.id) ?? [];
                  const latest = patientAssessments[0];
                  const initials =
                    (p.firstName?.[0] ?? "") + (p.lastName?.[0] ?? "");
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border last:border-0 hover:bg-sand"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-teal bg-teal-dim text-[0.7rem] font-bold text-teal-light">
                            {initials.toUpperCase() || "?"}
                          </div>
                          <span className="font-semibold text-ink">
                            {`${p.firstName} ${p.lastName}`.trim() || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[0.8rem] text-ink-muted">
                        {p.email}
                      </td>
                      <td className="px-4 py-3.5">
                        {patientAssessments.length}
                      </td>
                      <td className="px-4 py-3.5">
                        {latest ? (
                          <Badge variant={latest.tier.tier}>
                            {latest.tier.icon} {latest.tier.label}
                          </Badge>
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {p.createdAt ? formatDate(p.createdAt) : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={p.isActive ? "confirmed" : "pending"}
                        >
                          {p.isActive ? "Active" : "Suspended"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
