"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";

export default function DashboardShell({
  active,
  title,
  subtitle,
  action,
  children,
}: {
  active: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        active={active}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-navy/25 min-[681px]:hidden"
        />
      )}
      <div className="ml-[250px] flex min-h-screen min-w-0 flex-1 flex-col max-[680px]:ml-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-white px-8 py-[22px] max-[680px]:px-[18px] max-[680px]:py-4">
          <div className="min-w-0">
            <h1 className="font-display text-[1.3rem] text-navy">{title}</h1>
            <p className="mt-0.5 text-[0.78rem] text-ink-muted">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3 max-[680px]:order-first max-[680px]:w-full max-[680px]:justify-between">
            <button
              type="button"
              aria-label={
                sidebarOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-xl text-navy transition-colors hover:border-teal hover:text-teal min-[681px]:hidden"
            >
              <span aria-hidden="true">☰</span>
            </button>
            {action}
          </div>
        </div>
        <div className="min-w-0 flex-1 px-8 py-7 max-[680px]:px-[18px] max-[680px]:py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
