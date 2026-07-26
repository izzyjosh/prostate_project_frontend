type AlertType = "error" | "success" | "info" | "amber";

const typeClasses: Record<AlertType, string> = {
  error: "bg-danger-dim text-danger border-danger",
  success: "bg-success-dim text-success border-success",
  info: "bg-teal-dim text-teal border-teal",
  amber: "bg-amber-dim text-amber border-amber",
};

export default function Alert({
  message,
  type = "error",
}: {
  message: string;
  type?: AlertType;
}) {
  return (
    <div
      className={`mb-4 rounded-lg border-l-[3px] px-4 py-3 text-[0.83rem] ${typeClasses[type]}`}
    >
      {message}
    </div>
  );
}
