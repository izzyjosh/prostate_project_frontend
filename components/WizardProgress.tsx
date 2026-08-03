const STEPS = ["Urinary", "Systemic", "Pain", "Risk Factors", "Result"];

export default function WizardProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-9 flex items-center">
      {STEPS.map((label, idx) => {
        const stepNum = idx + 1;
        const isLast = stepNum === STEPS.length;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        return (
          <div key={label} className="contents">
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-[0.8rem] font-bold transition-all duration-300 ${
                  isActive
                    ? "border-teal bg-teal text-white"
                    : isDone
                    ? "border-teal bg-teal-dim text-teal"
                    : "border-border bg-white text-ink-muted"
                }`}
              >
                {stepNum === STEPS.length ? "✓" : stepNum}
              </div>
              <div
                className={`text-center text-[0.65rem] font-semibold ${
                  isActive ? "text-teal" : "text-ink-muted"
                }`}
              >
                {label}
              </div>
            </div>
            {!isLast && (
              <div
                className={`mb-[22px] h-0.5 flex-1 transition-colors duration-300 ${
                  isDone ? "bg-teal" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
