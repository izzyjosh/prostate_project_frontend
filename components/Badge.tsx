import { ReactNode } from "react";

type BadgeVariant = "low" | "moderate" | "high" | "urgent" | "pending" | "confirmed";

const variantClasses: Record<BadgeVariant, string> = {
  low: "bg-success-dim text-success",
  moderate: "bg-amber-dim text-amber",
  high: "bg-[rgba(212,136,42,0.2)] text-[#B36B00]",
  urgent: "bg-danger-dim text-danger",
  pending: "bg-teal-dim text-teal",
  confirmed: "bg-success-dim text-success",
};

export default function Badge({
  variant,
  children,
}: {
  variant: BadgeVariant;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[0.7rem] font-bold ${variantClasses[variant]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
