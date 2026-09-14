"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import {
  FormInput,
  FormSelect,
  FormRow2,
  FormSectionTitle,
} from "@/components/FormField";
import { authApiClient, getApiErrorMessage } from "@/lib/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function getMinimumAdultBirthDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().slice(0, 10);
}

function isFutureDate(dateOfBirth: string) {
  const today = new Date();
  const enteredDate = new Date(`${dateOfBirth}T00:00:00`);
  today.setHours(0, 0, 0, 0);
  return enteredDate > today;
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    dob: "",
    phone: "",
    address: "",
    occupation: "",
    bloodGroup: "",
    conditions: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [alert, setAlert] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !form.fname ||
      !form.lname ||
      !form.dob ||
      !form.phone ||
      !form.email ||
      !form.password ||
      !form.confirm
    ) {
      setAlert({ message: "Please fill all required fields.", type: "error" });
      return;
    }

    if (isFutureDate(form.dob)) {
      setAlert({
        message: "Date of birth cannot be in the future.",
        type: "error",
      });
      return;
    }

    const minimumAdultBirthDate = getMinimumAdultBirthDate();
    if (form.dob > minimumAdultBirthDate) {
      setAlert({
        message: "You must be at least 18 years old to register.",
        type: "error",
      });
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

    const knownConditions = form.conditions
      .split(",")
      .map((condition) => condition.trim())
      .filter(Boolean);

    try {
      await authApiClient.register({
        firstName: form.fname,
        lastName: form.lname,
        dateOfBirth: form.dob,
        phoneNumber: form.phone,
        address: form.address,
        occupation: form.occupation || undefined,
        bloodGroup: form.bloodGroup || undefined,
        knownConditions: knownConditions.length ? knownConditions : undefined,
        email: form.email,
        password: form.password,
      });
    } catch (error) {
      setAlert({
        message: getApiErrorMessage(
          error,
          "Unable to create your account. Check the details and try again.",
        ),
        type: "error",
      });
      return;
    }

    setAlert({
      message:
        "Account created successfully. A verification email has been sent to you. Please check your inbox and click the verification link before signing in.",
      type: "success",
    });
  }

  return (
    <AuthCard
      tagline="Patient Registration"
      heading="Create your account"
      sub="Register to begin your prostate cancer pre-assessment"
      wide
    >
      {alert && <Alert message={alert.message} type={alert.type} />}
      <form onSubmit={handleSubmit}>
        <FormSectionTitle first>Personal Information</FormSectionTitle>
        <FormRow2>
          <FormInput
            id="fname"
            label="First Name"
            placeholder="e.g. Emeka"
            value={form.fname}
            onChange={(e) => update("fname", e.target.value)}
          />
          <FormInput
            id="lname"
            label="Last Name"
            placeholder="e.g. Bello"
            value={form.lname}
            onChange={(e) => update("lname", e.target.value)}
          />
        </FormRow2>
        <FormRow2>
          <FormInput
            id="dob"
            label="Date of Birth"
            type="date"
            max={getMinimumAdultBirthDate()}
            value={form.dob}
            onChange={(e) => update("dob", e.target.value)}
          />
          <FormInput
            id="phone"
            label="Phone Number"
            type="tel"
            placeholder="+234 xxx xxxx"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </FormRow2>
        <FormInput
          id="address"
          label="Address"
          placeholder="Street, City, State"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
        />

        <FormSectionTitle>Medical Background</FormSectionTitle>
        <FormRow2>
          <FormInput
            id="occupation"
            label="Occupation"
            placeholder="e.g. Civil Servant"
            value={form.occupation}
            onChange={(e) => update("occupation", e.target.value)}
          />
          <FormSelect
            id="blood_group"
            label="Blood Group"
            value={form.bloodGroup}
            onChange={(e) => update("bloodGroup", e.target.value)}
          >
            <option value="">Select...</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg}>{bg}</option>
            ))}
          </FormSelect>
        </FormRow2>
        <FormInput
          id="conditions"
          label="Known Medical Conditions (if any)"
          placeholder="e.g. Hypertension, Diabetes — or leave blank"
          value={form.conditions}
          onChange={(e) => update("conditions", e.target.value)}
        />

        <FormSectionTitle>Account Credentials</FormSectionTitle>
        <FormInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
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
          Create Account →
        </Button>
      </form>
      <p className="mt-[18px] text-center text-[0.8rem] text-ink-muted">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-teal">
          Sign in
        </Link>
      </p>
      <p className="mt-2 text-center text-[0.8rem] text-ink-muted">
        Clinician?{" "}
        <Link href="/register/clinician" className="font-semibold text-teal">
          Register here
        </Link>
      </p>
    </AuthCard>
  );
}
