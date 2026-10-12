import BrandMark from "@/components/BrandMark";
import Button from "@/components/Button";
import TopNav from "@/components/TopNav";

const stats = [
  {
    icon: "🎯",
    title: "Risk-Stratified",
    detail: "Low · Moderate · High · Urgent",
  },
  {
    icon: "⚡",
    title: "Pre-Consultation Ready",
    detail: "Patient data available before doctor visit",
  },
  {
    icon: "🔒",
    title: "Secure Records",
    detail: "Centralized consultation database",
  },
];

const flow = [
  { label: "Patient\nRegisters", active: false },
  { label: "Pre-\nAssessment", active: false },
  { label: "Doctor\nReviews", active: false },
  { label: "Rx\nIssued", active: true },
];

const stages = [
  {
    num: "01",
    title: "Patient Registration",
    body: "Patients create a secure account and provide bio-data, medical history, and contact information.",
  },
  {
    num: "02",
    title: "Pre-Assessment",
    body: "A structured questionnaire captures urinary symptoms, risk factors, pain indicators, and family history.",
  },
  {
    num: "03",
    title: "Decision Support",
    body: "The risk evaluation engine scores responses and classifies your risk tier with clear urgency guidance.",
  },
  {
    num: "04",
    title: "Recommendations & Records",
    body: "The system provides personalized recommendations and securely stores your complete assessment record.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      <section className="flex min-h-[88vh] flex-col items-center gap-[60px] bg-white px-[5%] py-20 md:flex-row md:items-center">
        <div className="max-w-[520px] flex-1">
          <div className="mb-[18px] text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-teal">
            Prostate Risk Evaluation System
          </div>
          <h1 className="mb-5 text-[clamp(2.4rem,4.5vw,3.8rem)] leading-[1.08] text-ink">
            Prostate Cancer
            <br />
            <em className="text-teal not-italic italic">Pre-Assessment</em>
            <br />
            Made Precise.
          </h1>
          <p className="mb-8 max-w-[440px] text-base leading-[1.7] text-ink-mid">
            A web-based platform that captures patient symptoms, evaluates risk
            factors, and gives patients clear, structured recommendations —
            before the consultation begins.
          </p>
          <div className="mb-5 flex flex-wrap gap-3.5">
            <Button variant="primary-lg" href="/register">
              Begin Pre-Assessment
            </Button>
            <Button variant="outline-lg" href="/login">
              Login →
            </Button>
          </div>
          <p className="max-w-[400px] text-[0.72rem] leading-[1.5] text-ink-muted">
            This system supports clinical decision-making. It does not replace
            the judgement of a qualified medical professional.
          </p>
        </div>

        <div className="w-full flex-none md:w-[360px]">
          <div className="flex flex-col gap-3">
            {stats.map((s) => (
              <div
                key={s.title}
                className="flex items-center gap-3.5 rounded-xl border border-border bg-white px-[18px] py-3.5 shadow-card"
              >
                <span className="flex-shrink-0 text-[1.4rem]">{s.icon}</span>
                <div className="flex flex-col">
                  <strong className="text-[0.85rem] font-semibold text-ink">
                    {s.title}
                  </strong>
                  <span className="mt-px text-[0.72rem] text-ink-muted">
                    {s.detail}
                  </span>
                </div>
              </div>
            ))}

            <div className="mt-1 flex items-center gap-1.5 rounded-[10px] border border-border bg-surface-alt px-4 py-3.5">
              {flow.map((step, i) => (
                <span key={step.label} className="contents">
                  <span
                    className={
                      "flex-1 whitespace-pre-line text-center text-[0.65rem] font-medium leading-[1.3] " +
                      (step.active ? "font-bold text-teal" : "text-ink-muted")
                    }
                  >
                    {step.label}
                  </span>
                  {i < flow.length - 1 && (
                    <span className="text-[0.7rem] text-muted">→</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-[5%] py-20">
        <div className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-teal">
          How it works
        </div>
        <h2 className="mb-11 max-w-[500px] text-[clamp(1.8rem,3vw,2.6rem)] leading-tight text-navy">
          Four stages from registration to clinical recommendation
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
          {stages.map((stage) => (
            <div
              key={stage.num}
              className="rounded-[var(--radius-card-lg)] border border-border bg-white p-7 transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[var(--shadow-card-lg)]"
            >
              <div className="mb-3.5 font-display text-[2.2rem] leading-none text-teal opacity-35">
                {stage.num}
              </div>
              <h3 className="mb-2 font-sans text-base font-bold text-navy">
                {stage.title}
              </h3>
              <p className="text-[0.85rem] leading-[1.65] text-ink-muted">
                {stage.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="flex flex-col items-center gap-2 border-t border-border bg-white px-[5%] py-7 text-center">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-ink">
          <BrandMark small />
          <span>Prostatecare</span>
        </div>
        <p className="text-[0.72rem] text-ink-muted">
          Final Year Project · Prostatecare · 2026
        </p>
      </footer>
    </div>
  );
}
