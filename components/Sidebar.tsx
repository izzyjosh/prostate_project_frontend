"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandMark from "./BrandMark";
import { authApiClient, User } from "@/lib/api";

// Nav-menu grouping. "doctor" is the display alias for the API's "clinician" role.
type NavRole = "patient" | "doctor" | "admin";

interface NavItem {
  href: string;
  label: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface RoleConfig {
  tagline: string;
  sections: NavSection[];
}

const NAV_CONFIG: Record<NavRole, RoleConfig> = {
  patient: {
    tagline: "Patient Portal",
    sections: [
      {
        label: "Main",
        items: [
          { href: "/patient-dashboard", label: "Dashboard" },
          { href: "/pre-assessment", label: "Pre-Assessment" },
          { href: "/my-results", label: "My Results" },
          { href: "/my-prescriptions", label: "Recommendations" },
        ],
      },
      {
        label: "Account",
        items: [{ href: "/profile", label: "My Profile" }],
      },
    ],
  },
  doctor: {
    tagline: "Clinician Portal",
    sections: [
      {
        label: "Clinic",
        items: [
          { href: "/doctor-dashboard", label: "Dashboard" },
          { href: "/pending-reviews", label: "Pending Reviews" },
          { href: "/all-patients", label: "All Patients" },
          { href: "/prescriptions", label: "Recommendations" },
        ],
      },
      {
        label: "Reports",
        items: [{ href: "/reports", label: "Clinical Reports" }],
      },
    ],
  },
  admin: {
    tagline: "Admin Portal",
    sections: [
      {
        label: "System",
        items: [{ href: "/admin-dashboard", label: "Dashboard" }],
      },
    ],
  },
};

export default function Sidebar({
  active,
  open,
  onClose,
}: {
  active: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authApiClient.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      }
    };

    loadUser();
  }, []);

  function handleLogout() {
    authApiClient.logout().finally(() => {
      router.push("/login");
    });
  }

  // Admin accounts have no patient/clinician profile, so the API omits names.
  function userInitials() {
    if (!user) return "…";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return (user.email?.[0] ?? "U").toUpperCase();
  }

  function userDisplayName() {
    if (!user) return "Loading...";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email || "User";
  }

  const role =
    user?.role === "clinician" ? "doctor" : (user?.role ?? "patient");
  const config = NAV_CONFIG[role as NavRole];

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-shrink-0 flex-col border-r border-border bg-white shadow-[8px_0_24px_rgba(27,42,74,0.08)] transition-transform duration-200 min-[681px]:translate-x-0 min-[681px]:shadow-none ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center gap-2.5 border-b border-border px-[22px] pb-[18px] pt-5">
        <BrandMark small />
        <div className="flex flex-col">
          <span className="font-display text-[0.95rem] text-navy">
            Prostatecare
          </span>
          <span className="text-[0.6rem] text-ink-muted">{config.tagline}</span>
        </div>
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-lg text-ink-muted hover:bg-sand hover:text-navy min-[681px]:hidden"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {config.sections.map((section) => (
          <div key={section.label}>
            <div className="px-[22px] pb-1.5 pt-3.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-ink-muted">
              {section.label}
            </div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-[11px] border-l-[3px] px-[22px] py-[11px] text-[0.85rem] font-medium transition-all duration-150 ${
                  active === item.href
                    ? "border-teal bg-teal-dim text-navy"
                    : "border-transparent text-ink-mid hover:bg-sand hover:text-navy"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-[22px] py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full border border-teal bg-teal-dim text-[0.85rem] font-bold text-teal-light">
            {userInitials()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[0.82rem] font-semibold text-navy">
              {userDisplayName()}
            </div>
            <div className="text-[0.65rem] text-ink-muted">
              {user
                ? user.role === "clinician"
                  ? "Clinician"
                  : user.role.charAt(0).toUpperCase() + user.role.slice(1)
                : ""}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 text-[0.72rem] text-ink-muted transition-colors hover:text-navy"
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}
