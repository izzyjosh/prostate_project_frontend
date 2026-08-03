"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import PatientDetailModal from "@/components/PatientDetailModal";
import ReviewModal from "@/components/ReviewModal";
import {
  authApiClient,
  ClinicianAssessmentResponse,
  ClinicianPatientDetail,
  ClinicianPatientSummary,
  getApiErrorMessage,
} from "@/lib/api";

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AllPatientsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [patients, setPatients] = useState<ClinicianPatientSummary[]>([]);
  const [viewingPatient, setViewingPatient] =
    useState<ClinicianPatientDetail | null>(null);
  const [reviewing, setReviewing] =
    useState<ClinicianAssessmentResponse | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loadingPatientId, setLoadingPatientId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await authApiClient.getCurrentUser();
        if (user.role !== "clinician") {
          router.push("/login");
          return;
        }

        setPatients(await authApiClient.getClinicianPatients());
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setReady(true);
      }
    };

    load();
  }, [router]);

  if (!ready) return null;

  const filteredPatients = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(query.toLowerCase()) ||
      p.email.toLowerCase().includes(query.toLowerCase()),
  );

  async function openPatient(patientId: string) {
    setLoadingPatientId(patientId);
    try {
      setViewingPatient(
        await authApiClient.getClinicianPatientDetail(patientId),
      );
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoadingPatientId(null);
    }
  }

  return (
    <DashboardShell
      active="/all-patients"
      title="All Patients"
      subtitle="Registered patients and their pre-assessment activity"
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
                  "Last Submitted",
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
                filteredPatients.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0 hover:bg-sand"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-teal bg-teal-dim text-[0.7rem] font-bold text-teal-light">
                          {(p.firstName?.[0] ?? "") + (p.lastName?.[0] ?? "")}
                        </div>
                        <span className="font-semibold text-ink">
                          {p.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[0.8rem] text-ink-muted">
                      {p.email}
                    </td>
                    <td className="px-4 py-3.5">{p.assessmentsCount}</td>
                    <td className="px-4 py-3.5">
                      {p.latestAssessment ? (
                        <Badge variant={p.latestAssessment.tier.tier}>
                          {p.latestAssessment.tier.icon}{" "}
                          {p.latestAssessment.tier.label}
                        </Badge>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {p.latestAssessment
                        ? formatDate(p.latestAssessment.timestamp)
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <Button
                        variant="secondary"
                        small
                        onClick={() => openPatient(p.id)}
                        disabled={loadingPatientId === p.id}
                      >
                        {loadingPatientId === p.id ? "Loading..." : "View"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingPatient && (
        <PatientDetailModal
          patient={viewingPatient}
          onClose={() => setViewingPatient(null)}
          onReview={(record) => {
            setViewingPatient(null);
            setReviewing(record);
          }}
        />
      )}

      {reviewing && (
        <ReviewModal
          record={reviewing}
          onClose={() => setReviewing(null)}
          onSubmitted={() => {
            setReviewing(null);
            authApiClient
              .getClinicianPatients()
              .then(setPatients)
              .catch((loadError) => {
                setError(getApiErrorMessage(loadError));
              });
          }}
        />
      )}
    </DashboardShell>
  );
}
