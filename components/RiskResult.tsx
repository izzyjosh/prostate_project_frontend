import Button from "./Button";
import { CDSSResult, GroupKey, KNOWLEDGE_BASE } from "@/lib/cdss";

const BOX_CLASSES: Record<string, string> = {
  low: "border-success bg-success-dim",
  moderate: "border-amber bg-amber-dim",
  high: "border-[#B36B00] bg-[rgba(212,136,42,0.15)]",
  urgent: "border-danger bg-danger-dim",
};

export default function RiskResult({ result }: { result: CDSSResult }) {
  const t = result.tier;
  const groupEntries = Object.entries(KNOWLEDGE_BASE) as [
    GroupKey,
    (typeof KNOWLEDGE_BASE)[GroupKey],
  ][];
  const matchedByGroup: Record<
    GroupKey,
    (typeof KNOWLEDGE_BASE)[GroupKey]["questions"]
  > = {
    groupA: [],
    groupB: [],
    groupC: [],
    groupD: [],
  };
  groupEntries.forEach(([gk, g]) => {
    matchedByGroup[gk] = g.questions.filter((q) =>
      result.selectedIds.includes(q.id),
    );
  });

  return (
    <>
      <div
        className={`mb-6 rounded-card-lg border-2 p-7 ${BOX_CLASSES[t.bgClass]}`}
      >
        <div
          className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-[0.1em]"
          style={{ color: t.color }}
        >
          {t.icon} RISK CLASSIFICATION
        </div>
        <div
          className="mb-2 font-display text-[1.6rem]"
          style={{ color: t.color }}
        >
          {t.label} Risk
        </div>
        <div className="my-3.5 flex items-baseline gap-1">
          <div
            className="text-5xl font-bold leading-none"
            style={{ color: t.color }}
          >
            {result.percentage}%
          </div>
          <div className="text-[0.8rem] text-ink-muted">
            symptom score ({result.score} of {result.maxScore} points)
          </div>
        </div>
        <div className="text-[0.875rem] leading-[1.65]">{t.summary}</div>
        <div className="mt-3.5 rounded-lg bg-white/50 px-4 py-3">
          <div
            className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.08em]"
            style={{ color: t.color }}
          >
            Recommendation
          </div>
          <div className="text-[0.875rem] text-ink">
            {result.automaticRecommendation}
          </div>
          <div className="mt-3 border-t border-black/10 pt-3">
            <div
              className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.08em]"
              style={{ color: t.color }}
            >
              Risk-tier guidance
            </div>
            <div className="text-[0.875rem] text-ink">{t.recommendation}</div>
          </div>
          <div
            className="mt-2 text-[0.72rem] font-bold"
            style={{ color: t.color }}
          >
            ⏱ {t.urgency}
          </div>
        </div>
        <p className="mt-3 text-[0.72rem] italic text-ink-muted">
          This preliminary assessment is based on self-reported symptoms only. A
          clinician at ABUTH will review your responses before any clinical
          decision is made. This system does not replace physical examination,
          PSA testing, or professional medical judgement.
        </p>
      </div>

      <div className="mb-5 rounded-card-lg border border-border bg-white shadow-card">
        <div className="border-b border-border px-6 py-[18px]">
          <h3 className="text-[0.95rem] font-bold text-navy">
            Symptom Breakdown by Group
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {groupEntries.map(([gk, g]) => (
              <div key={gk} className="rounded-lg border border-border p-3.5">
                <div className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                  {g.icon} {g.label}
                </div>
                <div className="text-[1.4rem] font-bold text-navy">
                  {matchedByGroup[gk].length}
                  <span className="text-[0.75rem] font-normal text-ink-muted">
                    {" "}
                    / {g.questions.length} selected
                  </span>
                </div>
                <div className="mt-1 text-[0.75rem] text-ink-muted">
                  {result.breakdown[gk]} points contributed
                </div>
              </div>
            ))}
          </div>

          {result.selectedIds.length > 0 && (
            <div className="mt-5">
              <div className="mb-2.5 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                Selected Symptoms
              </div>
              {groupEntries.map(([gk, g]) =>
                matchedByGroup[gk].length > 0 ? (
                  <div key={gk} className="mb-2.5">
                    <div className="mb-1 text-[0.75rem] font-bold text-navy">
                      {g.icon} {g.label}
                    </div>
                    {matchedByGroup[gk].map((q) => (
                      <div
                        key={q.id}
                        className="border-b border-dotted border-border py-1 text-[0.8rem] text-ink-mid"
                      >
                        • {q.text}
                      </div>
                    ))}
                  </div>
                ) : null,
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" href="/patient-dashboard">
          ← Back to Dashboard
        </Button>
        <Button variant="secondary" href="/my-results">
          View All My Results
        </Button>
      </div>
    </>
  );
}
