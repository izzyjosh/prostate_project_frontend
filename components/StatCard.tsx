type Accent = "teal" | "amber" | "danger";

const accentClasses: Record<Accent, string> = {
  teal: "text-teal",
  amber: "text-amber",
  danger: "text-danger",
};

export default function StatCard({
  label,
  value,
  sub,
  accentColor,
  small,
}: {
  label: string;
  value: string;
  sub?: string;
  accentColor?: Accent;
  small?: boolean;
}) {
  return (
    <div className="rounded-card-lg border border-border bg-white p-5 shadow-card">
      <div className="mb-1.5 text-[0.7rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
        {label}
      </div>
      <div
        className={`font-bold leading-none ${small ? "text-[1.1rem]" : "text-[2rem]"} ${
          accentColor ? accentClasses[accentColor] : "text-navy"
        }`}
      >
        {value}
      </div>
      {sub && <div className="mt-[5px] text-[0.72rem] text-ink-muted">{sub}</div>}
    </div>
  );
}
