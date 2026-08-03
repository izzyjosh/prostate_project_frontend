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
  icon: string;
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
          { href: "/patient-dashboard", icon: "🏠", label: "Dashboard" },
          { href: "/pre-assessment", icon: "📋", label: "Pre-Assessment" },
          { href: "/my-results", icon: "📊", label: "My Results" },
          { href: "/my-prescriptions", icon: "💊", label: "Prescriptions" },
        ],
      },
      {
        label: "Account",
        items: [{ href: "/profile", icon: "👤", label: "My Profile" }],
      },
    ],
  },
  doctor: {
    tagline: "Clinician Portal",
    sections: [
      {
        label: "Clinic",
        items: [
          { href: "/doctor-dashboard", icon: "🏠", label: "Dashboard" },
          { href: "/pending-reviews", icon: "⏳", label: "Pending Reviews" },
          { href: "/all-patients", icon: "👥", label: "All Patients" },
          { href: "/prescriptions", icon: "💊", label: "Prescriptions" },
        ],
      },
      {
        label: "Reports",
        items: [{ href: "/reports", icon: "📊", label: "Clinical Reports" }],
      },
    ],
  },
  admin: {
    tagline: "Admin Portal",
    sections: [
      {
        label: "System",
        items: [{ href: "/admin-dashboard", icon: "🏠", label: "Dashboard" }],
      },
    ],
  },
};

export default function Sidebar({ active }: { active: string }) {
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
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-shrink-0 flex-col bg-navy">
      <div className="flex items-center gap-2.5 border-b border-white/[0.07] px-[22px] pb-[18px] pt-5">
        <BrandMark small />
        <div className="flex flex-col">
          <span className="font-display text-[0.95rem] text-white">
            ProstateCare
          </span>
          <span className="text-[0.6rem] text-white/45">{config.tagline}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {config.sections.map((section) => (
          <div key={section.label}>
            <div className="px-[22px] pb-1.5 pt-3.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-white/25">
              {section.label}
            </div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-[11px] border-l-[3px] px-[22px] py-[11px] text-[0.85rem] font-medium transition-all duration-150 ${
                  active === item.href
                    ? "border-teal bg-teal-dim text-white"
                    : "border-transparent text-white/55 hover:bg-white/[0.04] hover:text-white/85"
                }`}
              >
                <span className="w-5 text-center text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/[0.07] px-[22px] py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full border border-teal bg-teal-dim text-[0.85rem] font-bold text-teal-light">
            {userInitials()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[0.82rem] font-semibold text-white">
              {userDisplayName()}
            </div>
            <div className="text-[0.65rem] text-white/35">
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
          className="mt-2 text-[0.72rem] text-white/30 transition-colors hover:text-white/60"
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}
