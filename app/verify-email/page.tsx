"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import Button from "@/components/Button";

function VerificationResult() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("status") === "success";
  const message = searchParams.get("message");

  return (
    <AuthCard
      tagline="Email Verification"
      heading={
        isSuccess ? "Verification completed" : "Verification link unavailable"
      }
      sub={
        isSuccess
          ? "Your email address has been verified successfully."
          : message ||
            "This verification link is invalid or has expired. Please request a new verification email."
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="primary" href="/login" full>
          Go to Login
        </Button>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] border-2 border-border px-[22px] text-sm font-semibold text-ink-mid transition-colors hover:border-teal hover:text-teal"
        >
          Back to Home
        </Link>
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerificationResult />
    </Suspense>
  );
}
