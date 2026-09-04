import {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  useState,
} from "react";

const fieldClasses =
  "w-full rounded-lg border-[1.5px] border-border bg-sand px-3.5 py-2.5 text-[0.9rem] text-ink transition-colors duration-200 focus:border-teal focus:bg-white focus:outline-none";

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
}

function FieldWrapper({ label, htmlFor, children }: FieldWrapperProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[0.78rem] font-semibold tracking-wide text-ink"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FormInput({ label, id, ...rest }: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = rest.type === "password";

  return (
    <FieldWrapper label={label} htmlFor={id!}>
      <div className={isPassword ? "relative" : undefined}>
        <input
          id={id}
          className={`${fieldClasses}${isPassword ? " pr-11" : ""}`}
          {...rest}
          type={isPassword && showPassword ? "text" : rest.type}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {showPassword ? (
                <>
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                  <circle cx="12" cy="12" r="2.5" />
                </>
              ) : (
                <>
                  <path d="M3 3l18 18" />
                  <path d="M10.6 6.2A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a17.3 17.3 0 0 1-3.1 3.7" />
                  <path d="M6.6 6.7C4 8.2 2.5 12 2.5 12s3.5 6 9.5 6a10.7 10.7 0 0 0 3.2-.5" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>
    </FieldWrapper>
  );
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export function FormSelect({ label, id, children, ...rest }: FormSelectProps) {
  return (
    <FieldWrapper label={label} htmlFor={id!}>
      <select id={id} className={fieldClasses} {...rest}>
        {children}
      </select>
    </FieldWrapper>
  );
}

export function FormRow2({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">{children}</div>
  );
}

export function FormSectionTitle({
  children,
  first,
}: {
  children: ReactNode;
  first?: boolean;
}) {
  return (
    <div
      className={
        first
          ? "mb-3.5 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-teal"
          : "mb-3.5 mt-[22px] border-t border-border pt-[18px] text-[0.72rem] font-bold uppercase tracking-[0.08em] text-teal"
      }
    >
      {children}
    </div>
  );
}
