import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

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
  return (
    <FieldWrapper label={label} htmlFor={id!}>
      <input id={id} className={fieldClasses} {...rest} />
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
  return <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">{children}</div>;
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
