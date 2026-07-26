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
    body: "The CDSS engine scores responses and classifies the patient's risk tier with urgency flags for the clinician.",
  },
  {
    num: "04",
    title: "Prescription & Records",
    body: "The doctor confirms diagnosis, issues an electronic prescription, and all records are securely stored.",
  },
];

export default function Home() {
  return (
    <>
      <TopNav />

      <section className="flex min-h-[88vh] flex-col items-center gap-[60px] bg-gradient-to-br from-navy from-55% to-navy-light px-[5%] py-20 md:flex-row md:items-center">
        <div className="max-w-[520px] flex-1">
          <div className="mb-[18px] text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-teal-light">
            Ahmadu Bello University Teaching Hospital, Zaria
          </div>
          <h1 className="mb-5 text-[clamp(2.4rem,4.5vw,3.8rem)] leading-[1.08] text-white">
            Prostate Cancer
            <br />
            <em className="text-teal-light not-italic italic">Pre-Assessment</em>
            <br />
            Made Precise.
          </h1>
          <p className="mb-8 max-w-[440px] text-base leading-[1.7] text-white/60">
            A web-based platform that captures patient symptoms, evaluates risk
            factors, and equips clinicians with structured decision support —
            before the consultation begins.
          </p>
          <div className="mb-5 flex flex-wrap gap-3.5">
            <Button variant="primary-lg" href="/register">
              Begin Pre-Assessment
            </Button>
            <Button variant="outline-lg" href="/login">
              Clinician Login →
            </Button>
          </div>
          <p className="max-w-[400px] text-[0.72rem] leading-[1.5] text-white/30">
            This system supports clinical decision-making. It does not replace
            the judgement of a qualified medical professional.
          </p>
        </div>

        <div className="w-full flex-none md:w-[360px]">
          <div className="flex flex-col gap-3">
            {stats.map((s) => (
              <div
                key={s.title}
                className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/[0.07] px-[18px] py-3.5 backdrop-blur-[10px]"
              >
                <span className="flex-shrink-0 text-[1.4rem]">{s.icon}</span>
                <div className="flex flex-col">
                  <strong className="text-[0.85rem] font-semibold text-white">
                    {s.title}
                  </strong>
                  <span className="mt-px text-[0.72rem] text-white/45">
                    {s.detail}
                  </span>
                </div>
              </div>
            ))}

            <div className="mt-1 flex items-center gap-1.5 rounded-[10px] bg-white/5 px-4 py-3.5">
              {flow.map((step, i) => (
                <span key={step.label} className="contents">
                  <span
                    className={
                      "flex-1 whitespace-pre-line text-center text-[0.65rem] font-medium leading-[1.3] " +
                      (step.active
                        ? "font-bold text-teal-light"
                        : "text-white/50")
                    }
                  >
                    {step.label}
                  </span>
                  {i < flow.length - 1 && (
                    <span className="text-[0.7rem] text-white/25">→</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-[5%] py-20">
        <div className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-teal">
          How it works
        </div>
        <h2 className="mb-11 max-w-[500px] text-[clamp(1.8rem,3vw,2.6rem)] leading-tight text-navy">
          Four stages from registration to prescription
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

      <footer className="flex flex-col items-center gap-2 bg-navy px-[5%] py-7 text-center">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-white/70">
          <BrandMark small />
          <span>ABUTH ProstateCare CDSS</span>
        </div>
        <p className="text-[0.72rem] text-white/30">
          Final Year Project · Ahmadu Bello University Teaching Hospital,
          Zaria, Kaduna State · 2026
        </p>
      </footer>
    </>
  );
}
