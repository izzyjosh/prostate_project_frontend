"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import {
  authApiClient,
  AdminUser,
  getApiErrorMessage,
} from "@/lib/api";

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusBadge(status: string | null): "pending" | "confirmed" {
  return status === "approved" ? "confirmed" : "pending";
}

function statusLabel(status: string | null): string {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

export default function AdminDoctorsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [doctors, setDoctors] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const users = await authApiClient.getAdminUsers();
    setDoctors(users.filter((u) => u.role === "clinician"));
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await authApiClient.getCurrentUser();
        if (user.role !== "admin") {
          router.push("/login");
          return;
        }

        await load();
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setReady(true);
      }
    };

    init();
  }, [router, load]);

  async function runAction(
    action: () => Promise<unknown>,
    doctorId: string,
  ) {
    setBusyId(doctorId);
    try {
      await action();
      setError("");
      await load();
    } catch (actionError) {
      setError(getApiErrorMessage(actionError));
    } finally {
      setBusyId(null);
    }
  }

  if (!ready) return null;

  return (
    <DashboardShell
      active="/admin-doctors"
      title="Doctors"
      subtitle="Clinician accounts with access to the CDSS review workflow"
    >
      {error && <Alert type="error" message={error} />}

      <div className="rounded-card-lg border border-border bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-[0.85rem]">
            <thead>
              <tr>
                {[
                  "Clinician",
                  "Email",
                  "Registered",
                  "Status",
                  "Actions",
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
              {doctors.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-ink-muted"
                  >
                    No clinician accounts found.
                  </td>
                </tr>
              ) : (
                doctors.map((d) => {
                  const initials = (
                    (d.firstName?.[0] ?? "") + (d.lastName?.[0] ?? "")
                  ).toUpperCase();
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-border last:border-0 hover:bg-sand"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-teal bg-teal-dim text-[0.7rem] font-bold text-teal-light">
                            {initials || "?"}
                          </div>
                          <span className="font-semibold text-ink">
                            {`${d.firstName} ${d.lastName}`.trim() || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[0.8rem] text-ink-muted">
                        {d.email}
                      </td>
                      <td className="px-4 py-3.5">
                        {d.createdAt ? formatDate(d.createdAt) : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={statusBadge(d.status)}>
                          {statusLabel(d.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-2">
                          {d.status !== "approved" && (
                            <Button
                              variant="secondary"
                              small
                              onClick={() =>
                                runAction(
                                  () =>
                                    authApiClient.approveClinicianAccount(
                                      d.id,
                                    ),
                                  d.id,
                                )
                              }
                            >
                              {busyId === d.id ? "..." : "Approve"}
                            </Button>
                          )}
                          {d.status === "approved" && (
                            <>
                              <Button
                                variant="secondary"
                                small
                                onClick={() =>
                                  runAction(
                                    () => authApiClient.suspendUser(d.id),
                                    d.id,
                                  )
                                }
                              >
                                {busyId === d.id ? "..." : "Suspend"}
                              </Button>
                              <Button
                                variant="secondary"
                                small
                                onClick={() =>
                                  runAction(
                                    () => authApiClient.activateUser(d.id),
                                    d.id,
                                  )
                                }
                              >
                                {busyId === d.id ? "..." : "Activate"}
                              </Button>
                            </>
                          )}
                          {d.status === "pending" && (
                            <Button
                              variant="danger"
                              small
                              onClick={() =>
                                runAction(
                                  () =>
                                    authApiClient.rejectClinicianAccount(d.id),
                                  d.id,
                                )
                              }
                            >
                              {busyId === d.id ? "..." : "Reject"}
                            </Button>
                          )}
                        </div>
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
