"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { FormInput, FormSelect } from "@/components/FormField";
import { login, ROLE_ROUTES, Role } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [alert, setAlert] = useState<{ message: string; type: "error" | "success" } | null>(
    null
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = login(email, password, role);
    if ("error" in result) {
      setAlert({ message: result.error, type: "error" });
      return;
    }
    setAlert({ message: "Login successful! Redirecting...", type: "success" });
    setTimeout(() => {
      router.push(ROLE_ROUTES[result.user.role]);
    }, 900);
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
        <FormSelect
          id="role"
          label="Sign in as"
          value={role}
          onChange={(e) => setRole(e.target.value as Role | "")}
        >
          <option value="">Select your role...</option>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor / Clinician</option>
          <option value="admin">Administrator</option>
        </FormSelect>
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
    </AuthCard>
  );
}
