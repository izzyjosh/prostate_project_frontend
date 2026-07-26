import Link from "next/link";
import { ReactNode } from "react";

type Variant =
  | "ghost-nav"
  | "nav-primary"
  | "primary-lg"
  | "outline-lg"
  | "primary"
  | "secondary"
  | "danger";

const variantClasses: Record<Variant, string> = {
  "ghost-nav":
    "px-[18px] py-2 text-white/75 bg-transparent hover:text-white",
  "nav-primary":
    "px-5 py-[9px] bg-teal text-white rounded-lg hover:bg-teal-light",
  "primary-lg":
    "px-8 py-3.5 bg-teal text-white rounded-[var(--radius-card)] text-base hover:bg-teal-light hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(14,140,117,0.3)]",
  "outline-lg":
    "px-7 py-3.5 border-2 border-white/30 text-white/85 rounded-[var(--radius-card)] text-base hover:border-white/60 hover:text-white",
  primary: "px-[22px] py-2.5 bg-teal text-white hover:bg-teal-light rounded-[var(--radius-card)]",
  secondary:
    "px-[22px] py-2.5 bg-transparent border-2 border-border text-ink-mid rounded-[var(--radius-card)] hover:border-teal hover:text-teal",
  danger: "px-[22px] py-2.5 bg-danger text-white rounded-[var(--radius-card)]",
};

interface ButtonProps {
  variant: Variant;
  href?: string;
  full?: boolean;
  small?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  children: ReactNode;
}

export default function Button({
  variant,
  href,
  full,
  small,
  type = "button",
  onClick,
  children,
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold text-sm border-2 border-transparent cursor-pointer transition-all duration-150 ease-out",
    variantClasses[variant],
    full ? "w-full justify-center" : "",
    small ? "px-3.5 py-1.5 text-xs" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
