"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { FormInput, FormRow2, FormSectionTitle } from "@/components/FormField";
import { authApiClient } from "@/lib/api";

export default function ClinicianRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    licenseNumber: "",
    specialty: "",
    hospitalAffiliation: "",
    password: "",
    confirm: "",
  });
  const [alert, setAlert] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.licenseNumber ||
      !form.password ||
      !form.confirm
    ) {
      setAlert({ message: "Please fill all required fields.", type: "error" });
      return;
    }

    if (form.password.length < 8) {
      setAlert({
        message: "Password must be at least 8 characters.",
        type: "error",
      });
      return;
    }

    if (form.password !== form.confirm) {
      setAlert({ message: "Passwords do not match.", type: "error" });
      return;
    }

    try {
      await authApiClient.registerClinician({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        licenseNumber: form.licenseNumber,
        specialty: form.specialty || undefined,
        hospitalAffiliation: form.hospitalAffiliation || undefined,
      });
    } catch (error) {
      setAlert({
        message:
          error instanceof Error
            ? error.message
            : "Unable to create account. Please try again.",
        type: "error",
      });
      return;
    }

    setAlert({
      message:
        "Registration received. Your account will be reviewed before activation.",
      type: "success",
    });
    setTimeout(() => {
      router.push("/login");
    }, 1600);
  }

  return (
    <AuthCard
      tagline="Clinician Registration"
      heading="Create your clinician account"
      sub="Register with your professional details for admin review"
      wide
    >
      {alert && <Alert message={alert.message} type={alert.type} />}
      <form onSubmit={handleSubmit}>
        <FormSectionTitle first>Personal Details</FormSectionTitle>
        <FormRow2>
          <FormInput
            id="firstName"
            label="First Name"
            placeholder="e.g. Aisha"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />
          <FormInput
            id="lastName"
            label="Last Name"
            placeholder="e.g. Musa"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
        </FormRow2>
        <FormInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="your@hospital.org"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />

        <FormSectionTitle>Professional Information</FormSectionTitle>
        <FormInput
          id="licenseNumber"
          label="License Number"
          placeholder="MDCN / professional registration number"
          value={form.licenseNumber}
          onChange={(e) => update("licenseNumber", e.target.value)}
        />
        <FormRow2>
          <FormInput
            id="specialty"
            label="Specialty"
            placeholder="e.g. Urology"
            value={form.specialty}
            onChange={(e) => update("specialty", e.target.value)}
          />
          <FormInput
            id="hospitalAffiliation"
            label="Hospital Affiliation"
            placeholder="e.g. ABUTH"
            value={form.hospitalAffiliation}
            onChange={(e) => update("hospitalAffiliation", e.target.value)}
          />
        </FormRow2>

        <FormSectionTitle>Account Credentials</FormSectionTitle>
        <FormRow2>
          <FormInput
            id="password"
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
          <FormInput
            id="confirm"
            label="Confirm Password"
            type="password"
            placeholder="Repeat password"
            value={form.confirm}
            onChange={(e) => update("confirm", e.target.value)}
          />
        </FormRow2>

        <Button variant="primary" full type="submit">
          Submit Registration →
        </Button>
      </form>
      <p className="mt-[18px] text-center text-[0.8rem] text-ink-muted">
        Need a patient account?{" "}
        <Link href="/register" className="font-semibold text-teal">
          Register as Patient
        </Link>
      </p>
    </AuthCard>
  );
}
