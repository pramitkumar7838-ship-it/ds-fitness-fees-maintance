import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

const baseClasses =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand disabled:bg-bg disabled:text-ink-soft";

function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-ink mb-1.5">
      {children} {required && <span className="text-brand">*</span>}
    </label>
  );
}

interface FieldWrap {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
}

export function TextField({
  label,
  required,
  hint,
  error,
  className = "",
  ...props
}: FieldWrap & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <input className={`${baseClasses} ${className}`} {...props} />
      {hint && !error && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
      {error && <p className="mt-1 text-xs text-overdue">{error}</p>}
    </div>
  );
}

export function SelectField({
  label,
  required,
  hint,
  error,
  className = "",
  children,
  ...props
}: FieldWrap & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <select className={`${baseClasses} ${className}`} {...props}>
        {children}
      </select>
      {hint && !error && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
      {error && <p className="mt-1 text-xs text-overdue">{error}</p>}
    </div>
  );
}

export function TextAreaField({
  label,
  required,
  hint,
  error,
  className = "",
  ...props
}: FieldWrap & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <textarea className={`${baseClasses} ${className}`} rows={3} {...props} />
      {hint && !error && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
      {error && <p className="mt-1 text-xs text-overdue">{error}</p>}
    </div>
  );
}
