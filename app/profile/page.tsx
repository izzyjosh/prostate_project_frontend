"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import {
  FormInput,
  FormSelect,
  FormRow2,
  FormSectionTitle,
} from "@/components/FormField";
import { authApiClient, PatientProfileResponse } from "@/lib/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function ProfilePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<PatientProfileResponse | null>(null);
  const [form, setForm] = useState({
    phone: "",
    address: "",
    occupation: "",
    bloodGroup: "",
    conditions: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await authApiClient.getCurrentUser();
        if (user.role !== "patient") {
          router.push("/");
          return;
        }

        const data = await authApiClient.getPatientProfile();
        setProfile(data);
        setForm({
          phone: data.phoneNumber || "",
          address: data.address || "",
          occupation: data.occupation || "",
          bloodGroup: data.bloodGroup || "",
          conditions: data.knownConditions?.join(", ") || "",
        });
        setReady(true);
      } catch {
        router.push("/login");
      }
    };

    load();
  }, [router]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const knownConditions = form.conditions
      .split(",")
      .map((condition) => condition.trim())
      .filter(Boolean);

    authApiClient
      .updatePatientProfile({
        phoneNumber: form.phone,
        address: form.address,
        occupation: form.occupation,
        bloodGroup: form.bloodGroup,
        knownConditions,
      })
      .then((updated) => {
        setProfile(updated);
        setSaved(true);
      });
  }

  if (!ready || !profile) return null;

  return (
    <DashboardShell
      active="/profile"
      title="My Profile"
      subtitle="Your personal and medical details on file with ABUTH"
    >
      <div className="mx-auto max-w-[720px]">
        <div className="mb-6 flex items-center gap-4 rounded-card-lg border border-border bg-white p-6 shadow-card">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-2 border-teal bg-teal-dim text-[1.3rem] font-bold text-teal-light">
            {profile.firstName[0]}
            {profile.lastName[0]}
          </div>
          <div>
            <h2 className="font-display text-[1.25rem] text-navy">
              {profile.fullName}
            </h2>
            <p className="text-[0.82rem] text-ink-muted">{profile.email}</p>
            <p className="mt-0.5 text-[0.75rem] capitalize text-ink-muted">
              Patient
            </p>
          </div>
        </div>

        <div className="rounded-card-lg border border-border bg-white p-6 shadow-card sm:p-7">
          {saved && (
            <Alert type="success" message="Profile updated successfully." />
          )}

          <FormSectionTitle first>
            Personal Information (read-only)
          </FormSectionTitle>
          <FormRow2>
            <FormInput
              id="full-name"
              label="Full Name"
              value={profile.fullName}
              disabled
              readOnly
            />
            <FormInput
              id="dob"
              label="Date of Birth"
              value={profile.dateOfBirth || "—"}
              disabled
              readOnly
            />
          </FormRow2>
          <FormInput
            id="email"
            label="Email Address"
            value={profile.email}
            disabled
            readOnly
          />

          <form onSubmit={handleSave}>
            <FormSectionTitle>Contact &amp; Medical Details</FormSectionTitle>
            <FormRow2>
              <FormInput
                id="phone"
                label="Phone Number"
                type="tel"
                placeholder="+234 xxx xxxx"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
              <FormInput
                id="occupation"
                label="Occupation"
                placeholder="e.g. Civil Servant"
                value={form.occupation}
                onChange={(e) => update("occupation", e.target.value)}
              />
            </FormRow2>
            <FormInput
              id="address"
              label="Address"
              placeholder="Street, City, State"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
            <FormRow2>
              <FormSelect
                id="blood-group"
                label="Blood Group"
                value={form.bloodGroup}
                onChange={(e) => update("bloodGroup", e.target.value)}
              >
                <option value="">Select...</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg}>{bg}</option>
                ))}
              </FormSelect>
              <div />
            </FormRow2>
            <FormInput
              id="conditions"
              label="Known Medical Conditions"
              placeholder="e.g. Hypertension, Diabetes — or leave blank"
              value={form.conditions}
              onChange={(e) => update("conditions", e.target.value)}
            />

            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
