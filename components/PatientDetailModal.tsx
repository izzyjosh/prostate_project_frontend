"use client";

import { useEffect } from "react";
import Badge from "./Badge";
import Button from "./Button";
import { ClinicianAssessmentResponse, ClinicianPatientDetail } from "@/lib/api";

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PatientDetailModal({
  patient,
  onClose,
  onReview,
}: {
  patient: ClinicianPatientDetail;
  onClose: () => void;
  onReview: (record: ClinicianAssessmentResponse) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-navy/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-[90%] max-w-[680px] overflow-y-auto rounded-card-lg bg-white p-8 shadow-card-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1.5 flex items-center gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-teal bg-teal-dim text-[0.95rem] font-bold text-teal-light">
            {(patient.firstName?.[0] ?? "") + (patient.lastName?.[0] ?? "")}
          </div>
          <div>
            <h2 className="font-display text-[1.2rem] text-navy">
              {patient.fullName}
            </h2>
            <p className="text-[0.78rem] text-ink-muted">{patient.email}</p>
          </div>
        </div>

        <div className="my-5 grid grid-cols-2 gap-4 rounded-lg bg-sand p-4 text-[0.83rem] sm:grid-cols-3">
          <div>
            <div className="text-[0.65rem] uppercase tracking-[0.06em] text-ink-muted">
              Phone
            </div>
            <div className="font-medium text-ink">
              {patient.phoneNumber || "—"}
            </div>
          </div>
          <div>
            <div className="text-[0.65rem] uppercase tracking-[0.06em] text-ink-muted">
              Age
            </div>
            <div className="font-medium text-ink">{patient.age ?? "—"}</div>
          </div>
          <div>
            <div className="text-[0.65rem] uppercase tracking-[0.06em] text-ink-muted">
              Blood Group
            </div>
            <div className="font-medium text-ink">
              {patient.bloodGroup || "—"}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <div className="text-[0.65rem] uppercase tracking-[0.06em] text-ink-muted">
              Address
            </div>
            <div className="font-medium text-ink">{patient.address || "—"}</div>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <div className="text-[0.65rem] uppercase tracking-[0.06em] text-ink-muted">
              Known Conditions
            </div>
            <div className="font-medium text-ink">
              {patient.knownConditions.length > 0
                ? patient.knownConditions.join(", ")
                : "None reported"}
            </div>
          </div>
        </div>

        <div className="mb-2.5 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
          Assessment History ({patient.assessments.length})
        </div>
        {patient.assessments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-5 text-center text-[0.83rem] text-ink-muted">
            No assessments submitted yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {patient.assessments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-border p-3.5"
              >
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant={a.tier.tier}>
                      {a.tier.icon} {a.tier.label}
                    </Badge>
                    <Badge
                      variant={
                        a.status === "confirmed" ? "confirmed" : "pending"
                      }
                    >
                      {a.status === "confirmed" ? "Reviewed" : "Pending"}
                    </Badge>
                  </div>
                  <div className="text-[0.8rem] text-ink-muted">
                    {formatDate(a.timestamp)} — {a.percentage}% ({a.score}/
                    {a.maxScore} pts)
                  </div>
                </div>
                {a.status === "pending" && (
                  <Button variant="secondary" small onClick={() => onReview(a)}>
                    Review →
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
