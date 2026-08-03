import { Question } from "@/lib/cdss";

export default function QuestionList({
  questions,
  selectedIds,
  onToggle,
}: {
  questions: Question[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {questions.map((q) => {
        const selected = selectedIds.has(q.id);
        return (
          <div
            key={q.id}
            onClick={() => onToggle(q.id)}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border-[1.5px] px-4 py-3 transition-all duration-150 ${
              selected
                ? "border-teal bg-teal-dim"
                : "border-border bg-white hover:border-teal hover:bg-teal-dim"
            }`}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggle(q.id)}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-teal"
            />
            <label className="cursor-pointer text-[0.875rem] leading-[1.4] text-ink">
              {q.text}
            </label>
          </div>
        );
      })}
    </div>
  );
}
