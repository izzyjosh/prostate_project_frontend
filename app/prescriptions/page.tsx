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

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PrescriptionsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [issued, setIssued] = useState<ClinicianAssessmentResponse[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const user = await authApiClient.getCurrentUser();
        if (user.role !== "clinician") {
          router.push("/login");
          return;
        }

        setIssued(await authApiClient.getClinicianPrescriptions());
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
      active="/prescriptions"
      title="Prescriptions"
      subtitle="Medications and clinical guidance issued across all patients"
    >
      {error && <Alert type="error" message={error} />}

      {issued.length === 0 ? (
        <div className="rounded-card-lg border border-border bg-white p-12 text-center shadow-card">
          <div className="mb-3 text-4xl">💊</div>
          <h3 className="mb-2 font-display text-[1.3rem] text-navy">
            No prescriptions issued yet
          </h3>
          <p className="text-ink-muted">
            Prescriptions will appear here after a clinician review is
            submitted.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {issued.map((a) => (
            <div
              key={a.id}
              className="rounded-card-lg border border-border bg-white shadow-card"
            >
              <div className="flex items-center justify-between border-b border-border bg-sand px-6 py-4">
                <div>
                  <div className="font-display text-[1.05rem] text-navy">
                    {a.patientName}
                  </div>
                  <div className="mt-0.5 text-[0.75rem] text-ink-muted">
                    Issued {a.reviewedAt ? formatDate(a.reviewedAt) : "—"}
                    {a.urgency ? ` — ${a.urgency}` : ""}
                  </div>
                </div>
                <Badge variant={a.tier.tier}>
                  {a.tier.icon} {a.tier.label}
                </Badge>
              </div>
              <div className="p-6">
                <div className="mb-3">
                  <div className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                    Patient Email
                  </div>
                  <div className="text-[0.85rem] text-ink">
                    {a.patientEmail || "—"}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                    Clinical Impression
                  </div>
                  <div className="text-[0.85rem] text-ink">
                    {a.confirmedDiagnosis || "—"}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                    Medications / Prescription
                  </div>
                  <div className="text-[0.85rem] text-ink">
                    {a.prescription || "—"}
                  </div>
                </div>
                {a.doctorNotes && (
                  <div className="mb-3">
                    <div className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                      Notes
                    </div>
                    <div className="text-[0.85rem] text-ink">
                      {a.doctorNotes}
                    </div>
                  </div>
                )}
                {a.followupDate && (
                  <div className="text-[0.78rem] text-ink-muted">
                    Follow-up:{" "}
                    {new Date(a.followupDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
