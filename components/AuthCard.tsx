import Link from "next/link";
import { ReactNode } from "react";
import BrandMark from "./BrandMark";

export default function AuthCard({
  tagline,
  heading,
  sub,
  wide,
  children,
}: {
  tagline: string;
  heading: string;
  sub: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-5 py-10">
      <div
        className={`w-full rounded-card-lg bg-white p-10 shadow-card-lg ${
          wide ? "max-w-[540px]" : "max-w-[460px]"
        }`}
      >
        <div className="mb-7 text-center">
          <div className="mb-1.5 flex items-center justify-center gap-2.5">
            <BrandMark />
            <span className="font-display text-[1.3rem] text-navy">
              Prostatecare
            </span>
          </div>
          <span className="text-[0.75rem] text-teal">{tagline}</span>
        </div>
        <h2 className="mb-1 font-display text-[1.4rem] text-navy">{heading}</h2>
        <p className="mb-7 text-[0.82rem] text-ink-muted">{sub}</p>
        {children}
      </div>
      <Link
        href="/"
        className="mt-[18px] inline-flex items-center gap-1.5 text-[0.78rem] text-white/40 transition-colors hover:text-white/70"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
