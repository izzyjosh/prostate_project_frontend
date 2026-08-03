import { ReactNode } from "react";
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
  return (
    <div className="flex min-h-screen">
      <Sidebar active={active} />
      <div className="ml-[250px] flex min-h-screen flex-1 flex-col max-[680px]:ml-0">
        <div className="flex items-center justify-between border-b border-border bg-white px-8 py-[22px]">
          <div>
            <h1 className="font-display text-[1.3rem] text-navy">{title}</h1>
            <p className="mt-0.5 text-[0.78rem] text-ink-muted">{subtitle}</p>
          </div>
          {action}
        </div>
        <div className="flex-1 px-8 py-7 max-[680px]:px-[18px]">{children}</div>
      </div>
    </div>
  );
}
