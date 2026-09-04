"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { FormInput } from "@/components/FormField";
import { authApiClient, getApiErrorMessage } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      setAlert({ message: "Please fill in all fields.", type: "error" });
      return;
    }

    try {
      await authApiClient.login(email, password);

      const currentUser = await authApiClient.getCurrentUser();

      const route =
        currentUser.role === "clinician"
          ? "/doctor-dashboard"
          : currentUser.role === "admin"
            ? "/admin-dashboard"
            : "/patient-dashboard";

      router.replace(route);
    } catch (error) {
      setAlert({
        message: getApiErrorMessage(
          error,
          "Unable to sign in. Check your email and password and try again.",
        ),
        type: "error",
      });
      return;
    }
  }

  return (
    <AuthCard
      tagline="Clinical Decision Support System"
      heading="Welcome back"
      sub="Sign in to access your account"
    >
      {alert && <Alert message={alert.message} type={alert.type} />}
      <form onSubmit={handleSubmit}>
        <FormInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormInput
          id="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="primary" full type="submit">
          Sign In →
        </Button>
      </form>
      <p className="mt-[18px] text-center text-[0.8rem] text-ink-muted">
        New patient?{" "}
        <Link href="/register" className="font-semibold text-teal">
          Create an account
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
